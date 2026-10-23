import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGeolocation } from './useGeolocation'

type PositionCallback = Parameters<Geolocation['getCurrentPosition']>

function stubGeolocation(
  respond: (success: PositionCallback[0], failure: PositionCallback[1]) => void,
) {
  const getCurrentPosition = vi.fn(
    (success: PositionCallback[0], failure: PositionCallback[1]) =>
      respond(success, failure),
  )
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  return getCurrentPosition
}

function succeed(success: PositionCallback[0]) {
  success({
    coords: { latitude: 37.5, longitude: 127 },
  } as GeolocationPosition)
}

function failWith(code: number) {
  return (_: PositionCallback[0], failure: PositionCallback[1]) =>
    failure?.({ code } as GeolocationPositionError)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useGeolocation', () => {
  it('위치를 조회하면 좌표를 돌려준다', async () => {
    stubGeolocation(succeed)
    const { result } = renderHook(() => useGeolocation())

    let coordinates
    await act(async () => {
      coordinates = await result.current.locate()
    })

    expect(coordinates).toEqual({ lat: 37.5, lng: 127 })
    expect(result.current.coordinates).toEqual({ lat: 37.5, lng: 127 })
    expect(result.current.status).toBe('located')
  })

  it('한 번 조회한 좌표는 다시 쓴다', async () => {
    const getCurrentPosition = stubGeolocation(succeed)
    const { result } = renderHook(() => useGeolocation())

    await act(() => result.current.locate())
    await act(() => result.current.locate())

    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it('권한을 거부하면 denied가 된다', async () => {
    stubGeolocation(failWith(1))
    const { result } = renderHook(() => useGeolocation())

    let coordinates
    await act(async () => {
      coordinates = await result.current.locate()
    })

    expect(coordinates).toBeNull()
    expect(result.current.coordinates).toBeNull()
    expect(result.current.status).toBe('denied')
  })

  it('위치를 알 수 없으면 unavailable이 된다', async () => {
    stubGeolocation(failWith(2))
    const { result } = renderHook(() => useGeolocation())

    await act(() => result.current.locate())

    expect(result.current.status).toBe('unavailable')
  })

  it('브라우저가 위치를 지원하지 않으면 unsupported가 된다', async () => {
    vi.stubGlobal('navigator', {})
    const { result } = renderHook(() => useGeolocation())

    await act(() => result.current.locate())

    expect(result.current.status).toBe('unsupported')
  })
})
