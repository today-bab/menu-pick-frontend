import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickMenu } from './pickMenu'
import { PickError, type PickResult } from './types'

const result: PickResult = {
  menu: '냉면',
  restaurants: [
    {
      name: '을밀대',
      distanceMeters: 120,
      placeUrl: 'http://place.map.kakao.com/1',
    },
  ],
}

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pickMenu', () => {
  it('좌표와 직전 메뉴를 쿼리로 보내고 결과를 돌려준다', async () => {
    const fetchMock = stubFetch(Response.json(result))

    await expect(
      pickMenu({ lat: 37.5, lng: 127, exclude: '돈까스' }),
    ).resolves.toEqual(result)

    const url = fetchMock.mock.calls[0][0] as URL
    expect(url.pathname).toBe('/api/menus/pick')
    expect(url.searchParams.get('lat')).toBe('37.5')
    expect(url.searchParams.get('lng')).toBe('127')
    expect(url.searchParams.get('exclude')).toBe('돈까스')
  })

  it('직전 메뉴가 없으면 exclude를 보내지 않는다', async () => {
    const fetchMock = stubFetch(Response.json(result))

    await pickMenu({ lat: 37.5, lng: 127 })

    const url = fetchMock.mock.calls[0][0] as URL
    expect(url.searchParams.has('exclude')).toBe(false)
  })

  it.each([
    [400, 'invalid-location'],
    [404, 'no-restaurants'],
    [502, 'upstream'],
    [500, 'unknown'],
  ])('응답 상태 %i는 %s 오류가 된다', async (status, kind) => {
    stubFetch(new Response(null, { status }))

    await expect(pickMenu({ lat: 37.5, lng: 127 })).rejects.toMatchObject({
      kind,
    })
  })

  it('네트워크 오류는 network 오류가 된다', async () => {
    stubFetch(new TypeError('Failed to fetch'))

    const error = await pickMenu({ lat: 37.5, lng: 127 }).catch((e) => e)

    expect(error).toBeInstanceOf(PickError)
    expect(error.kind).toBe('network')
  })
})
