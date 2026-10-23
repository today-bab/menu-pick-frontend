import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { PickResult } from './api/types'
import { server } from './mocks/node'

const naengmyeon: PickResult = {
  menu: '냉면',
  restaurants: [
    {
      name: '평양면옥',
      distanceMeters: 210,
      placeUrl: 'https://example.com/1',
    },
    {
      name: '함흥냉면',
      distanceMeters: 1540,
      placeUrl: 'https://example.com/2',
    },
  ],
}

const donkatsu: PickResult = {
  menu: '돈까스',
  restaurants: [
    { name: '카츠정', distanceMeters: 130, placeUrl: 'https://example.com/3' },
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
    expect(
      screen.getByRole('link', { name: /평양면옥.*210m/ }),
    ).toHaveAttribute('href', 'https://example.com/1')
    expect(screen.getByRole('link', { name: /함흥냉면.*1\.5km/ })).toBeVisible()
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
