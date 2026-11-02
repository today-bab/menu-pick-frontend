import type { MenuCategory } from '../api/types'
import type { MenuExclusions } from '../exclusions/useMenuExclusions'

type CategoryFilterProps = {
  categories: MenuCategory[]
  exclusions: MenuExclusions
  onToggleCuisine: (cuisine: string) => void
  /** 대분류를 뺀 상태면 예외로 다룰 수 있도록 메뉴가 속한 대분류도 함께 알린다. */
  onToggleMenu: (menu: string, cuisine: string) => void
}

const chipClass = 'rounded-full border px-3 py-1 text-sm'
const includedClass =
  'border-gray-200 bg-white text-gray-900 hover:border-orange-500'
// 빠진 것은 흐리게 긋고, 다시 누르면 돌아온다.
const excludedClass = 'border-gray-100 bg-gray-100 text-gray-500 line-through'

/**
 * 근처 메뉴를 대분류별로 보여주고, 추천에서 뺄 대분류나 메뉴를 고르게 한다.
 * 덮는 시트 안에 들어가므로 길어지면 시트가 스크롤을 맡는다.
 */
export function CategoryFilter({
  categories,
  exclusions,
  onToggleCuisine,
  onToggleMenu,
}: CategoryFilterProps) {
  return (
    <section className="flex flex-col gap-5">
      <p className="text-xs text-gray-500">
        누르면 추천에서 빠지고, 다시 누르면 돌아와요
      </p>
      {categories.map(({ name, menus }) => {
        const cuisineExcluded = exclusions.cuisines.includes(name)
        return (
          <div key={name} role="group" aria-label={name}>
            <button
              type="button"
              aria-pressed={cuisineExcluded}
              onClick={() => onToggleCuisine(name)}
              className={`${chipClass} font-medium ${
                cuisineExcluded ? excludedClass : includedClass
              }`}
            >
              {name} 전체
            </button>
            <ul className="mt-2 flex flex-wrap gap-2">
              {menus.map((menu) => {
                // 대분류를 통째로 뺐으면 그 안의 메뉴도 빠진 것으로 보이지만,
                // 메뉴를 누르면 그것만 예외로 다시 넣을 수 있다.
                const excluded =
                  (cuisineExcluded &&
                    !(exclusions.includedMenus[name] ?? []).includes(menu)) ||
                  exclusions.menus.includes(menu)
                return (
                  <li key={menu}>
                    <button
                      type="button"
                      aria-pressed={excluded}
                      onClick={() => onToggleMenu(menu, name)}
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
    </section>
  )
}
