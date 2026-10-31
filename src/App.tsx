import { useEffect, useState } from 'react'
import type { PickErrorKind, Restaurant } from './api/types'
import { useMenuCategories } from './api/useMenuCategories'
import { usePickMenu } from './api/usePickMenu'
import { CategoryFilter } from './components/CategoryFilter'
import { MenuResult } from './components/MenuResult'
import { RestaurantMap } from './components/RestaurantMap'
import { useMenuExclusions } from './exclusions/useMenuExclusions'
import { usePickHistory } from './history/usePickHistory'
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
  'all-excluded': '제외한 메뉴를 빼면 근처에 고를 메뉴가 없어요.',
  upstream: '음식점 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  network: '서버에 연결할 수 없어요.',
  unknown: '알 수 없는 오류가 났어요.',
}

const historyButtonClass =
  'flex-1 rounded-xl border border-neutral-300 py-2 hover:border-orange-500 hover:text-orange-600 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700'

function App() {
  const { status, coordinates, locate } = useGeolocation()
  const { mutate, error, isPending } = usePickMenu()
  const history = usePickHistory()
  // 카테고리 조회가 실패해도 안내 없이 제외 설정만 숨기고, 뽑기는 그대로 쓸 수 있게 한다.
  const { data: categories } = useMenuCategories(coordinates)
  const { exclusions, toggleCuisine, toggleMenu } = useMenuExclusions()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  // 뽑기 전에도 내 주변 지도를 보여주려고 접속하자마자 위치를 조회한다.
  useEffect(() => {
    void locate()
  }, [locate])

  // 새로 뽑다 실패해도 보던 결과는 기록에 남아 있어 그대로 보여준다.
  const data = history.current

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
      mutate(
        {
          ...coordinates,
          exclude: data?.menu,
          excludedCuisines: exclusions.cuisines,
          excludedMenus: exclusions.menus,
          // 서버는 메뉴 이름만 받으면 되니 대분류별로 나눠 둔 예외를 한 목록으로 편다.
          includedMenus: Object.values(exclusions.includedMenus).flat(),
        },
        { onSuccess: (result) => showResult(() => history.add(result)) },
      )
    }
  }

  // 보이는 결과가 바뀌면 가게 선택도 다시 가장 가까운 가게로 돌린다.
  function showResult(move: () => void) {
    move()
    setSelectedUrl(null)
  }

  return (
    // 아래 여백은 하단에 붙는 뽑기 버튼 영역이 맡아서, 버튼 밑에 빈 띠가 생기지 않게 위쪽만 띄운다.
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center gap-8 px-4 pt-12">
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
      {!data &&
        (coordinates ? (
          <RestaurantMap
            me={coordinates}
            restaurants={[]}
            selected={null}
            onSelect={() => {}}
          />
        ) : (
          status === 'locating' && (
            <div className="h-72 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          )
        ))}
      {/* 뽑는 중에 옮겨 다니면 제외한 메뉴와 보이는 메뉴가 어긋나서 막아 둔다. */}
      {history.entries.length > 1 && (
        <nav aria-label="이전 결과" className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => showResult(history.back)}
            disabled={busy || !history.canBack}
            className={historyButtonClass}
          >
            ← 이전
          </button>
          <button
            type="button"
            onClick={() => showResult(history.forward)}
            disabled={busy || !history.canForward}
            className={historyButtonClass}
          >
            다음 →
          </button>
        </nav>
      )}
      {categories && (
        <CategoryFilter
          categories={categories}
          exclusions={exclusions}
          onToggleCuisine={toggleCuisine}
          onToggleMenu={toggleMenu}
        />
      )}
      {/*
        내용이 길어져도 스크롤하지 않고 바로 누를 수 있게 뽑기 버튼을 화면 아래에 붙여 둔다.
        밑으로 지나가는 내용이 비치지 않도록 페이지와 같은 배경을 깔고,
        오류 안내도 버튼과 함께 붙여서 내용에 묻혀 안 보이는 일이 없게 한다.
      */}
      <div className="sticky bottom-0 z-10 flex w-full flex-col gap-3 bg-white pt-3 pb-6 dark:bg-neutral-950">
        {notice && (
          <p
            role="alert"
            className="text-center text-red-600 dark:text-red-400"
          >
            {notice}
          </p>
        )}

        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          className="w-full rounded-xl bg-orange-500 py-4 text-lg font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {status === 'locating'
            ? '위치 찾는 중…'
            : isPending
              ? '고르는 중…'
              : data
                ? '다시 뽑기'
                : '메뉴 뽑기'}
        </button>
      </div>
    </main>
  )
}

export default App
