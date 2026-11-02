import { useCallback, useEffect, useState } from 'react'
import type { PickErrorKind, Restaurant } from './api/types'
import { useMenuCategories } from './api/useMenuCategories'
import { usePickMenu } from './api/usePickMenu'
import { CategoryFilter } from './components/CategoryFilter'
import { CountButton } from './components/CountButton'
import { HistoryList } from './components/HistoryList'
import { MenuResult } from './components/MenuResult'
import { OverlaySheet } from './components/OverlaySheet'
import { RestaurantMap } from './components/RestaurantMap'
import { useMenuExclusions } from './exclusions/useMenuExclusions'
import { usePickHistory } from './history/usePickHistory'
import { MapLayout } from './layout/MapLayout'
import { SheetContent } from './layout/SheetContent'
import { useMapPadding } from './layout/useMapPadding'
import { DEFAULT_LOCATION } from './location/defaultLocation'
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

function App() {
  const { status, coordinates, locate } = useGeolocation()
  const { mutate, error, isPending } = usePickMenu()
  const history = usePickHistory()
  // 카테고리 조회가 실패해도 안내 없이 제외 설정만 숨기고, 뽑기는 그대로 쓸 수 있게 한다.
  const { data: categories } = useMenuCategories(coordinates)
  const { exclusions, toggleCuisine, toggleMenu } = useMenuExclusions()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [openSheet, setOpenSheet] = useState<'exclusions' | 'history' | null>(
    null,
  )
  // 시트가 열릴 때마다 포커스를 다시 잡지 않도록 닫기 함수는 한 번만 만든다.
  const closeSheet = useCallback(() => setOpenSheet(null), [])
  const excludedCount = exclusions.cuisines.length + exclusions.menus.length
  const { sheetRef, padding } = useMapPadding()

  // 뽑기 전에도 내 주변 지도를 보여주려고 접속하자마자 위치를 조회한다.
  useEffect(() => {
    void locate()
  }, [locate])

  // 새로 뽑다 실패해도 보던 결과는 기록에 남아 있어 그대로 보여준다.
  const data = history.current
  // 위치를 모르는 동안에도 지도는 늘 보여주고, 그때는 기본 위치를 가운데 둔다.
  const center = coordinates ?? DEFAULT_LOCATION

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
    <>
      <MapLayout
        sheetRef={sheetRef}
        map={
          <RestaurantMap
            center={center}
            me={coordinates}
            restaurants={data?.restaurants ?? []}
            selected={selected}
            onSelect={selectRestaurant}
            padding={padding}
          />
        }
        actions={
          <>
            {/* 뽑는 중에 옮겨 다니면 제외한 메뉴와 보이는 메뉴가 어긋나서 막아 둔다. */}
            <CountButton
              label="기록"
              count={history.entries.length}
              onClick={() => setOpenSheet('history')}
              disabled={busy || history.entries.length === 0}
            />
            {/* 카테고리를 못 불러오면 고를 것이 없으니 제외 버튼도 숨긴다. */}
            {categories && (
              <CountButton
                label="제외"
                count={excludedCount}
                onClick={() => setOpenSheet('exclusions')}
              />
            )}
          </>
        }
        sheet={
          <SheetContent
            footer={
              <>
                {notice && (
                  <p role="alert" className="text-center text-red-600">
                    {notice}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handlePick}
                  disabled={busy}
                  className="h-[52px] w-full rounded-[14px] bg-orange-500 text-base font-bold text-white hover:brightness-95 disabled:opacity-60"
                >
                  {status === 'locating'
                    ? '위치 찾는 중…'
                    : isPending
                      ? '고르는 중…'
                      : data
                        ? '다시 뽑기'
                        : '메뉴 뽑기'}
                </button>
              </>
            }
          >
            {data ? (
              <MenuResult
                result={data}
                selected={selected}
                onSelect={selectRestaurant}
              />
            ) : (
              <p className="py-2 text-center text-[15px] text-gray-700">
                근처 1km 안에서 골라 드려요
              </p>
            )}
          </SheetContent>
        }
      />
      <OverlaySheet
        title="이번에 뽑은 메뉴"
        open={openSheet === 'history'}
        onClose={closeSheet}
      >
        <HistoryList
          entries={history.entries}
          currentIndex={history.index}
          onSelect={(index) => {
            showResult(() => history.select(index))
            closeSheet()
          }}
        />
      </OverlaySheet>
      {categories && (
        <OverlaySheet
          title="제외할 메뉴"
          open={openSheet === 'exclusions'}
          onClose={closeSheet}
        >
          <CategoryFilter
            categories={categories}
            exclusions={exclusions}
            onToggleCuisine={toggleCuisine}
            onToggleMenu={toggleMenu}
          />
        </OverlaySheet>
      )}
    </>
  )
}

export default App
