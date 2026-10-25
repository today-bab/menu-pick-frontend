import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { PickResult } from './api/types'
import type { RestaurantMap } from './components/RestaurantMap'
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

function renderApp() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

beforeEach(() => {
  stubLocation()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('뽑기를 누르면 메뉴와 근처 가게를 보여준다', async () => {
    respondInOrder(naengmyeon)
    const user = renderApp()

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
    const user = renderApp()

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
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    expect(await screen.findByTestId('map')).toHaveTextContent('평양면옥')

    await user.click(screen.getByRole('button', { name: /함흥냉면/ }))

    expect(screen.getByTestId('map')).toHaveTextContent('함흥냉면')
    expect(screen.getByRole('button', { name: /함흥냉면/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('다시 뽑으면 직전 메뉴를 제외하고 요청한다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu)
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: '다시 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '돈까스' }),
    ).toBeInTheDocument()
    expect(excludes).toEqual([null, '냉면'])
  })

  it('이전 결과로 돌아갔다가 다시 앞으로 갈 때 서버에 요청하지 않는다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu)
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: /함흥냉면/ }))
    await user.click(screen.getByRole('button', { name: '다시 뽑기' }))
    expect(
      await screen.findByRole('heading', { name: '돈까스' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음 →' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '← 이전' }))

    expect(screen.getByRole('heading', { name: '냉면' })).toBeInTheDocument()
    // 결과가 바뀌면 직접 골랐던 가게 대신 가장 가까운 가게로 돌아간다.
    expect(screen.getByTestId('map')).toHaveTextContent('평양면옥')
    expect(screen.getByRole('button', { name: '← 이전' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '다음 →' }))

    expect(screen.getByRole('heading', { name: '돈까스' })).toBeInTheDocument()
    expect(excludes).toEqual([null, '냉면'])
  })

  it('이전 결과를 보다가 다시 뽑으면 보고 있던 메뉴를 제외하고 그 뒤 기록은 버린다', async () => {
    const excludes = respondInOrder(naengmyeon, donkatsu, donkatsu)
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))
    await user.click(await screen.findByRole('button', { name: '다시 뽑기' }))
    await screen.findByRole('heading', { name: '돈까스' })
    await user.click(screen.getByRole('button', { name: '← 이전' }))
    await user.click(screen.getByRole('button', { name: '다시 뽑기' }))

    expect(
      await screen.findByRole('heading', { name: '돈까스' }),
    ).toBeInTheDocument()
    expect(excludes).toEqual([null, '냉면', '냉면'])
    expect(screen.getByRole('button', { name: '다음 →' })).toBeDisabled()
  })

  it('다시 뽑다 실패해도 보던 결과는 남는다', async () => {
    respondInOrder(naengmyeon)
    const user = renderApp()

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

  it('위치 권한을 거부하면 안내를 보여준다', async () => {
    stubLocation(1)
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('위치 권한')
  })

  it('근처에 음식점이 없으면 안내를 보여준다', async () => {
    server.use(
      http.get(
        '*/api/menus/pick',
        () => new HttpResponse(null, { status: 404 }),
      ),
    )
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: '메뉴 뽑기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '음식점이 없어요',
    )
  })
})
