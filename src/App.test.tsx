import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { MenuCategory, PickResult } from './api/types'
import type { RestaurantMap } from './components/RestaurantMap'
import { STORAGE_KEY } from './exclusions/useMenuExclusions'
import { server } from './mocks/node'

// 카카오 지도는 jsdom에서 그릴 수 없어 선택된 가게만 보여주는 가짜로 바꾼다.
vi.mock('./components/RestaurantMap', () => ({
  RestaurantMap: ({ selected }: Parameters<typeof RestaurantMap>[0]) => (
    <div data-testid="map">{selected?.name}</div>
  ),
}))

const naengmyeon: PickResult = {
  menu: '냉면',
  restaurants: [
    {
      name: '평양면옥',
      distanceMeters: 210,
      lat: 37.502,
      lng: 127.001,
      placeUrl: 'https://example.com/1',
    },
    {
      name: '함흥냉면',
      distanceMeters: 1540,
      lat: 37.512,
      lng: 127.008,
      placeUrl: 'https://example.com/2',
    },
  ],
}

const donkatsu: PickResult = {
  menu: '돈까스',
  restaurants: [
    {
      name: '카츠정',
      distanceMeters: 130,
      lat: 37.501,
      lng: 126.999,
      placeUrl: 'https://example.com/3',
    },
  ],
}

function stubLocation(code?: number) {
  const getCurrentPosition = (
    success: PositionCallback,
    failure?: PositionErrorCallback | null,
  ) =>
    code === undefined
      ? success({
          coords: { latitude: 37.5, longitude: 127 },
        } as GeolocationPosition)
      : failure?.({ code } as GeolocationPositionError)
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: { getCurrentPosition },
  })
}

const categories: MenuCategory[] = [
  { name: '한식', menus: ['국밥', '냉면'] },
  { name: '중식', menus: ['짜장면'] },
]

function respondCategories(response: () => Response) {
  server.use(http.get('*/api/menus/categories', response))
}

// 뽑기 요청마다 쿼리를 모아 두고 결과를 차례로 돌려준다.
function recordPicks(result: PickResult) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get('*/api/menus/pick', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(result)
    }),
  )
  return requests
}

function respondInOrder(...results: PickResult[]) {
  const excludes: (string | null)[] = []
  server.use(
    http.get('*/api/menus/pick', ({ request }) => {
      excludes.push(new URL(request.url).searchParams.get('exclude'))
      return HttpResponse.json(results[excludes.length - 1])
    }),
  )
  return excludes
}

function mountApp() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>,
  )
}

// 접속하자마자 위치를 조회하므로 그 조회가 끝나 뽑기 버튼이 풀릴 때까지 기다린다.
async function renderApp() {
  mountApp()
  await screen.findByRole('button', { name: '메뉴 뽑기' })
  return userEvent.setup()
}

beforeEach(() => {
  stubLocation()
  // 개발용 가짜 서버는 일부러 늦게 답해서 테스트에서는 바로 답하게 바꾼다.
  respondCategories(() => HttpResponse.json({ categories }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('App', () => {
  it('접속하자마자 위치를 조회해 뽑기 전에도 지도를 보여준다', async () => {
    await renderApp()

    expect(screen.getByTestId('map')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('접속 직후 위치를 찾는 동안에는 메뉴를 고르는 중이라고 하지 않는다', async () => {
    mountApp()

    expect(screen.getByRole('button', { name: '위치 찾는 중…' })).toBeDisabled()
    expect(
      await screen.findByRole('button', { name: '메뉴 뽑기' }),
    ).toBeEnabled()
  })

  it('뽑기를 누르면 메뉴와 근처 가게를 보여준다', async () => {
    respondInOrder(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '냉면' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /평양면옥.*210m/ })).toBeVisible()
    expect(
      screen.getByRole('button', { name: /함흥냉면.*1\.5km/ }),
    ).toBeVisible()
  })

  it('가게마다 그 가게의 상세 페이지 링크를 준다', async () => {
    respondInOrder(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(
      await screen.findByRole('link', { name: '평양면옥 카카오맵에서 보기' }),
    ).toHaveAttribute('href', 'https://example.com/1')
    expect(
      screen.getByRole('link', { name: '함흥냉면 카카오맵에서 보기' }),
    ).toHaveAttribute('href', 'https://example.com/2')
  })

  it('처음에는 가장 가까운 가게가, 목록에서 누르면 그 가게가 지도에서 선택된다', async () => {
    respondInOrder(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await screen.findByRole('heading', { name: '냉면' })
    expect(screen.getByTestId('map')).toHaveTextContent('평양면옥')

    await user.click(screen.getByRole('button', { name: /함흥냉면/ }))

    expect(screen.getByTestId('map')).toHaveTextContent('함흥냉면')
    expect(screen.getByRole('button', { name: /함흥냉면/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('다시 뽑으면 직전 메뉴를 제외하고 요청한다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: '다시 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '돈까스' }),
    ).toBeInTheDocument()
    expect(excludes).toEqual([null, '냉면'])
  })

  it('뽑기 전에는 기록 버튼을 누를 수 없다', async () => {
    await renderApp()

    expect(screen.getByRole('button', { name: '기록' })).toBeDisabled()
  })

  it('기록에서 이전 결과로 돌아갈 때 서버에 요청하지 않는다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: /함흥냉면/ }))
    await user.click(screen.getByRole('button', { name: '다시 뽑기' }))
    await screen.findByRole('heading', { name: '돈까스' })

    await user.click(screen.getByRole('button', { name: '기록 2' }))
    const sheet = screen.getByRole('dialog', { name: '이번에 뽑은 메뉴' })
    await user.click(within(sheet).getByRole('button', { name: /냉면/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '냉면' })).toBeInTheDocument()
    // 결과가 바뀌면 직접 골랐던 가게 대신 가장 가까운 가게로 돌아간다.
    expect(screen.getByTestId('map')).toHaveTextContent('평양면옥')
    expect(excludes).toEqual([null, '냉면'])
  })

  it('이전 결과를 보다가 다시 뽑으면 보고 있던 메뉴를 제외하고 기록은 그대로 쌓는다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu, donkatsu)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: '다시 뽑기' }))
    await screen.findByRole('heading', { name: '돈까스' })
    await user.click(screen.getByRole('button', { name: '기록 2' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /냉면/ }),
    )
    await user.click(screen.getByRole('button', { name: '다시 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '돈까스' }),
    ).toBeInTheDocument()
    expect(excludes).toEqual([null, '냉면', '냉면'])
    expect(screen.getByRole('button', { name: '기록 3' })).toBeInTheDocument()
  })

  it('다시 뽑다 실패해도 보던 결과는 남는다', async () => {
    respondInOrder(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await screen.findByRole('heading', { name: '냉면' })
    server.use(
      http.get(
        '*/api/menus/pick',
        () => new HttpResponse(null, { status: 404 }),
      ),
    )
    await user.click(screen.getByRole('button', { name: '다시 뽑기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '음식점이 없어요',
    )
    expect(screen.getByRole('heading', { name: '냉면' })).toBeInTheDocument()
  })

  it('접속할 때 위치 권한을 거부하면 기본 위치 지도와 함께 안내를 보여준다', async () => {
    stubLocation(1)
    await renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent('위치 권한')
    expect(screen.getByTestId('map')).toBeInTheDocument()
  })

  it('근처에 음식점이 없으면 안내를 보여준다', async () => {
    server.use(
      http.get(
        '*/api/menus/pick',
        () => new HttpResponse(null, { status: 404 }),
      ),
    )
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '음식점이 없어요',
    )
  })

  it('제외한 대분류와 메뉴를 뽑기 요청에 함께 보낸다', async () => {
    const requests = recordPicks(naengmyeon)
    const user = await renderApp()

    await user.click(await screen.findByRole('button', { name: '제외' }))
    const sheet = screen.getByRole('dialog', { name: '제외할 메뉴' })
    await user.click(within(sheet).getByRole('button', { name: '중식 전체' }))
    await user.click(within(sheet).getByRole('button', { name: '국밥' }))
    await user.click(within(sheet).getByRole('button', { name: '닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '제외 2' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    await screen.findByRole('heading', { name: '냉면' })
    expect(requests[0].getAll('excludeCuisine')).toEqual(['중식'])
    expect(requests[0].getAll('excludeMenu')).toEqual(['국밥'])
  })

  it('다시 접속해도 저장해 둔 제외 설정으로 뽑는다', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cuisines: ['한식'], menus: ['짜장면'] }),
    )
    const requests = recordPicks(donkatsu)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    await screen.findByRole('heading', { name: '돈까스' })
    expect(requests[0].getAll('excludeCuisine')).toEqual(['한식'])
    expect(requests[0].getAll('excludeMenu')).toEqual(['짜장면'])
  })

  it('뺀 대분류 안에서 예외로 다시 넣은 메뉴를 함께 보낸다', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cuisines: ['한식'],
        menus: [],
        includedMenus: { 한식: ['냉면'] },
      }),
    )
    const requests = recordPicks(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    await screen.findByRole('heading', { name: '냉면' })
    expect(requests[0].getAll('excludeCuisine')).toEqual(['한식'])
    expect(requests[0].getAll('includeMenu')).toEqual(['냉면'])
  })

  it('카테고리를 불러오지 못하면 제외 설정 없이 뽑기만 보여준다', async () => {
    respondCategories(() => new HttpResponse(null, { status: 404 }))
    const requests = recordPicks(naengmyeon)
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '냉면' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^제외/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(requests[0].has('excludeCuisine')).toBe(false)
    expect(requests[0].has('excludeMenu')).toBe(false)
  })

  it('제외한 것을 빼면 고를 메뉴가 없을 때 안내를 보여준다', async () => {
    server.use(
      http.get(
        '*/api/menus/pick',
        () => new HttpResponse(null, { status: 422 }),
      ),
    )
    const user = await renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '제외한 메뉴를 빼면 근처에 고를 메뉴가 없어요.',
    )
  })
})
