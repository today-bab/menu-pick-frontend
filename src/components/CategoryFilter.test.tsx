import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MenuCategory } from '../api/types'
import type { MenuExclusions } from '../exclusions/useMenuExclusions'
import { CategoryFilter } from './CategoryFilter'

const categories: MenuCategory[] = [
  { name: '한식', menus: ['국밥', '냉면'] },
  { name: '중식', menus: ['짜장면'] },
]

function renderFilter(
  exclusions: MenuExclusions = { cuisines: [], menus: [], includedMenus: {} },
) {
  const onToggleCuisine = vi.fn()
  const onToggleMenu = vi.fn()
  render(
    <CategoryFilter
      categories={categories}
      exclusions={exclusions}
      onToggleCuisine={onToggleCuisine}
      onToggleMenu={onToggleMenu}
    />,
  )
  return { user: userEvent.setup(), onToggleCuisine, onToggleMenu }
}

describe('CategoryFilter', () => {
  it('처음에는 접혀 있다가 누르면 대분류별 메뉴를 펼친다', async () => {
    const { user } = renderFilter()
    const toggle = screen.getByRole('button', { name: /제외할 메뉴/ })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const korean = screen.getByRole('group', { name: '한식' })
    expect(
      within(korean).getByRole('button', { name: '한식 전체' }),
    ).toBeInTheDocument()
    expect(within(korean).getByRole('button', { name: '국밥' })).toBeVisible()
    expect(within(korean).getByRole('button', { name: '냉면' })).toBeVisible()
    expect(
      within(screen.getByRole('group', { name: '중식' })).getByRole('button', {
        name: '짜장면',
      }),
    ).toBeVisible()
  })

  it('제외한 것이 없으면 개수를 보여주지 않는다', () => {
    renderFilter()

    expect(
      screen.getByRole('button', { name: /제외할 메뉴/ }),
    ).not.toHaveTextContent('제외 중')
  })

  it('접혀 있어도 몇 개를 제외하고 있는지 보여준다', () => {
    renderFilter({ cuisines: ['중식'], menus: ['국밥'], includedMenus: {} })

    expect(
      screen.getByRole('button', { name: /제외할 메뉴/ }),
    ).toHaveTextContent('(2개 제외 중)')
  })

  it('대분류와 메뉴를 누르면 그 이름을 알린다', async () => {
    const { user, onToggleCuisine, onToggleMenu } = renderFilter()
    await user.click(screen.getByRole('button', { name: /제외할 메뉴/ }))

    await user.click(screen.getByRole('button', { name: '중식 전체' }))
    await user.click(screen.getByRole('button', { name: '국밥' }))

    expect(onToggleCuisine).toHaveBeenCalledWith('중식')
    expect(onToggleMenu).toHaveBeenCalledWith('국밥', '한식')
  })

  it('제외한 메뉴는 눌린 상태로 보여준다', async () => {
    const { user } = renderFilter({
      cuisines: [],
      menus: ['국밥'],
      includedMenus: {},
    })
    await user.click(screen.getByRole('button', { name: /제외할 메뉴/ }))

    expect(screen.getByRole('button', { name: '국밥' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '냉면' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('대분류를 통째로 빼면 그 안의 메뉴도 제외된 채로 고를 수 없다', async () => {
    const { user } = renderFilter({
      cuisines: ['한식'],
      menus: [],
      includedMenus: {},
    })
    await user.click(screen.getByRole('button', { name: /제외할 메뉴/ }))

    expect(screen.getByRole('button', { name: '한식 전체' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const menu of ['국밥', '냉면']) {
      const chip = screen.getByRole('button', { name: menu })
      expect(chip).toHaveAttribute('aria-pressed', 'true')
      expect(chip).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: '짜장면' })).toBeEnabled()
  })
})
