import type { PickResult } from '../api/types'

type HistoryListProps = {
  /** 뽑은 순서(오래된 것부터)대로 쌓인 기록. */
  entries: PickResult[]
  currentIndex: number
  /** 고른 기록의 `entries` 안 순서를 알린다. */
  onSelect: (index: number) => void
}

/**
 * 이번 방문에서 뽑은 메뉴를 최신순으로 보여주고, 누르면 그 결과로 돌아가게 한다.
 */
export function HistoryList({
  entries,
  currentIndex,
  onSelect,
}: HistoryListProps) {
  // 최근 것을 위에 보여주되, 알릴 때는 원래 순서를 쓴다.
  const newestFirst = entries
    .map((entry, index) => ({ entry, index }))
    .reverse()

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        {newestFirst.map(({ entry, index }) => {
          const current = index === currentIndex
          return (
            <li key={index}>
              <button
                type="button"
                aria-current={current || undefined}
                onClick={() => onSelect(index)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left ${
                  current ? 'bg-orange-50' : 'hover:bg-gray-100'
                }`}
              >
                <span
                  className={`truncate text-[15px] font-medium ${
                    current ? 'text-orange-500' : 'text-gray-900'
                  }`}
                >
                  {entry.menu}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  가게 {entry.restaurants.length}곳
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-center text-xs text-gray-500">
        새로고침하면 기록이 사라져요
      </p>
    </div>
  )
}
