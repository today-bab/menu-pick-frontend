import type { Restaurant } from '../api/types'

function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

type RestaurantRowProps = {
  restaurant: Restaurant
  selected: boolean
  onSelect: (restaurant: Restaurant) => void
}

/** 결과 목록의 가게 한 줄. 누르면 지도에서 그 가게를 고르고, 오른쪽 링크로 카카오맵을 연다. */
export function RestaurantRow({
  restaurant,
  selected,
  onSelect,
}: RestaurantRowProps) {
  return (
    <li className="flex h-12 items-center gap-3 border-t border-gray-100">
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(restaurant)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
      >
        <span
          className={`truncate text-[15px] ${
            selected ? 'font-medium text-orange-500' : 'text-gray-900'
          }`}
        >
          {restaurant.name}
        </span>
        <span className="shrink-0 text-xs text-gray-500">
          {formatDistance(restaurant.distanceMeters)}
        </span>
      </button>
      <a
        href={restaurant.placeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${restaurant.name} 카카오맵에서 보기`}
        className="shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 hover:border-gray-500"
      >
        카카오맵
      </a>
    </li>
  )
}
