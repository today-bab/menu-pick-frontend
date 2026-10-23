import type { PickResult } from '../api/types'

function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

type MenuResultProps = {
  result: PickResult
}

export function MenuResult({ result }: MenuResultProps) {
  return (
    <section aria-label="뽑힌 메뉴" className="w-full">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        오늘의 메뉴
      </p>
      <h2 className="mt-1 text-4xl font-bold">{result.menu}</h2>

      <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
        {result.restaurants.map((restaurant) => (
          <li key={restaurant.placeUrl}>
            <a
              href={restaurant.placeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between py-3 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <span>{restaurant.name}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDistance(restaurant.distanceMeters)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
