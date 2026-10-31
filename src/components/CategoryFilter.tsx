import { useId, useState } from 'react'
import type { MenuCategory } from '../api/types'
import type { MenuExclusions } from '../exclusions/useMenuExclusions'

type CategoryFilterProps = {
  categories: MenuCategory[]
  exclusions: MenuExclusions
  onToggleCuisine: (cuisine: string) => void
  onToggleMenu: (menu: string) => void
}

const chipClass =
  'rounded-full border px-3 py-1 text-sm disabled:pointer-events-none'
const includedClass =
  'border-neutral-300 hover:border-orange-500 hover:text-orange-600 dark:border-neutral-700 dark:hover:text-orange-400'
// 빠진 것은 흐리게 긋고, 눌러서 다시 넣을 수 있다는 걸 테두리로 남긴다.
const excludedClass =
  'border-neutral-200 bg-neutral-100 text-neutral-400 line-through dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500'

/**
 * 근처 메뉴를 대분류별로 보여주고, 추천에서 뺄 대분류나 메뉴를 고르게 한다.
 * 늘 쓰는 기능은 아니라서 처음에는 접어 두고 몇 개를 빼고 있는지만 알려준다.
 */
export function CategoryFilter({
  categories,
  exclusions,
  onToggleCuisine,
  onToggleMenu,
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const excludedCount = exclusions.cuisines.length + exclusions.menus.length

  return (
    <section className="w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-300 px-4 py-2 hover:border-orange-500 dark:border-neutral-700"
      >
        <span>
          제외할 메뉴
          {excludedCount > 0 && (
            <span className="ml-1 text-orange-600 dark:text-orange-400">
              ({excludedCount}개 제외 중)
            </span>
          )}
        </span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div id={panelId} className="mt-3 flex flex-col gap-4">
          {categories.map(({ name, menus }) => {
            const cuisineExcluded = exclusions.cuisines.includes(name)
            return (
              <div key={name} role="group" aria-label={name}>
                <button
                  type="button"
                  aria-pressed={cuisineExcluded}
                  onClick={() => onToggleCuisine(name)}
                  className={`${chipClass} font-semibold ${
                    cuisineExcluded ? excludedClass : includedClass
                  }`}
                >
                  {name} 전체
                </button>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {menus.map((menu) => {
                    // 대분류를 통째로 뺐으면 그 안의 메뉴도 빠진 것으로 보이고, 따로 고를 수 없다.
                    const excluded =
                      cuisineExcluded || exclusions.menus.includes(menu)
                    return (
                      <li key={menu}>
                        <button
                          type="button"
                          aria-pressed={excluded}
                          disabled={cuisineExcluded}
                          onClick={() => onToggleMenu(menu)}
                          className={`${chipClass} ${
                            excluded ? excludedClass : includedClass
                          }`}
                        >
                          {menu}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
