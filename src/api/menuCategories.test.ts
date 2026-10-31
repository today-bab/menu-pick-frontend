import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMenuCategories } from './menuCategories'
import type { MenuCategory } from './types'

const categories: MenuCategory[] = [
  { name: '한식', menus: ['국밥', '냉면'] },
  { name: '중식', menus: ['짜장면'] },
]

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

describe('fetchMenuCategories', () => {
  it('좌표를 쿼리로 보내고 대분류 목록을 돌려준다', async () => {
    const fetchMock = stubFetch(Response.json({ categories }))

    await expect(fetchMenuCategories({ lat: 37.5, lng: 127 })).resolves.toEqual(
      categories,
    )

    const url = fetchMock.mock.calls[0][0] as URL
    expect(url.pathname).toBe('/api/menus/categories')
    expect(url.searchParams.get('lat')).toBe('37.5')
    expect(url.searchParams.get('lng')).toBe('127')
  })

  it.each([404, 502])('응답 상태 %i이면 실패한다', async (status) => {
    stubFetch(new Response(null, { status }))

    await expect(fetchMenuCategories({ lat: 37.5, lng: 127 })).rejects.toThrow()
  })

  it('네트워크 오류면 실패한다', async () => {
    stubFetch(new TypeError('Failed to fetch'))

    await expect(fetchMenuCategories({ lat: 37.5, lng: 127 })).rejects.toThrow()
  })
})
