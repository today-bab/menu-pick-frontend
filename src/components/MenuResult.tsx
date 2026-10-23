import type { ReactNode } from 'react'
import type { PickResult, Restaurant } from '../api/types'

function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

type MenuResultProps = {
  result: PickResult
  selected: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
  /** 메뉴 이름과 가게 목록 사이에 놓을 내용 (지도). */
  children?: ReactNode
}

export function MenuResult({
  result,
  selected,
  onSelect,
  children,
}: MenuResultProps) {
  return (
    <section aria-label="뽑힌 메뉴" className="w-full">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        오늘의 메뉴
      </p>
      <h2 className="mt-1 text-4xl font-bold">{result.menu}</h2>

      <div className="mt-6">{children}</div>

      <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {result.restaurants.map((restaurant) => {
          const isSelected = restaurant === selected
          return (
            <li key={restaurant.placeUrl} className="flex items-center gap-3">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(restaurant)}
                className={`flex flex-1 items-center justify-between py-3 text-left ${
                  isSelected
                    ? 'font-semibold text-orange-600 dark:text-orange-400'
                    : 'hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                <span>{restaurant.name}</span>
                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  {formatDistance(restaurant.distanceMeters)}
                </span>
              </button>
              <a
                href={restaurant.placeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${restaurant.name} 카카오맵에서 보기`}
                className="shrink-0 rounded-lg border border-neutral-300 px-2 py-1 text-xs hover:border-orange-500 hover:text-orange-600 dark:border-neutral-700"
              >
                카카오맵
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
