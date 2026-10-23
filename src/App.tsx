import { useState } from 'react'
import type { PickErrorKind, Restaurant } from './api/types'
import { usePickMenu } from './api/usePickMenu'
import { MenuResult } from './components/MenuResult'
import { RestaurantMap } from './components/RestaurantMap'
import {
  useGeolocation,
  type GeolocationStatus,
} from './location/useGeolocation'

const locationNotices: Partial<Record<GeolocationStatus, string>> = {
  denied: '위치 권한이 필요해요. 브라우저 설정에서 위치를 허용해 주세요.',
  unavailable: '현재 위치를 알 수 없어요. 잠시 후 다시 시도해 주세요.',
  unsupported: '이 브라우저는 위치 조회를 지원하지 않아요.',
}

const errorNotices: Record<PickErrorKind, string> = {
  'invalid-location': '위치 정보가 올바르지 않아요.',
  'no-restaurants': '근처 1km 안에 음식점이 없어요.',
  upstream: '음식점 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  network: '서버에 연결할 수 없어요.',
  unknown: '알 수 없는 오류가 났어요.',
}

function App() {
  const { status, coordinates, locate } = useGeolocation()
  const { mutate, data, error, isPending } = usePickMenu()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  // 따로 고르지 않았으면 가장 가까운 가게를 선택한 것으로 본다.
  const selected =
    data?.restaurants.find(({ placeUrl }) => placeUrl === selectedUrl) ??
    data?.restaurants[0] ??
    null
  const selectRestaurant = ({ placeUrl }: Restaurant) =>
    setSelectedUrl(placeUrl)

  const busy = status === 'locating' || isPending
  const notice = locationNotices[status] ?? (error && errorNotices[error.kind])

  async function handlePick() {
    const coordinates = await locate()
    if (coordinates) {
      mutate({ ...coordinates, exclude: data?.menu })
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center gap-8 px-4 py-12">
      <h1 className="text-2xl font-bold">오늘 뭐 먹지</h1>

      {data && (
        <MenuResult
          result={data}
          selected={selected}
          onSelect={selectRestaurant}
        >
          {coordinates && (
            <RestaurantMap
              me={coordinates}
              restaurants={data.restaurants}
              selected={selected}
              onSelect={selectRestaurant}
            />
          )}
        </MenuResult>
      )}
      {notice && (
        <p role="alert" className="text-center text-red-600 dark:text-red-400">
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={handlePick}
        disabled={busy}
        className="w-full rounded-xl bg-orange-500 py-4 text-lg font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {busy ? '고르는 중…' : data ? '다시 뽑기' : '메뉴 뽑기'}
      </button>
    </main>
  )
}

export default App
