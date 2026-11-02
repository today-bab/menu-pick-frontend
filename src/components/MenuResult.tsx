import type { PickResult, Restaurant } from '../api/types'
import { RestaurantRow } from './RestaurantRow'

type MenuResultProps = {
  result: PickResult
  selected: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
}

/**
 * 뽑힌 메뉴와 근처 가게 목록. 메뉴 이름은 위에 고정하고,
 * 가게가 많으면 목록만 시트 안에서 스크롤한다.
 */
export function MenuResult({ result, selected, onSelect }: MenuResultProps) {
  return (
    <section aria-label="뽑힌 메뉴" className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-3">
        <p className="text-xs text-gray-500">오늘의 메뉴</p>
        <h2 className="truncate text-[28px] leading-tight font-bold tracking-tight">
          {result.menu}
        </h2>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {result.restaurants.map((restaurant) => (
          <RestaurantRow
            key={restaurant.placeUrl}
            restaurant={restaurant}
            selected={restaurant === selected}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  )
}
