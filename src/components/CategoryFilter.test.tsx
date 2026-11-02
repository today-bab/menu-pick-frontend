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
  it('대분류별로 통째로 빼는 버튼과 메뉴를 보여준다', () => {
    renderFilter()

    const korean = screen.getByRole('group', { name: '한식' })
    expect(
      within(korean).getByRole('button', { name: '한식 전체' }),
    ).toBeVisible()
    expect(within(korean).getByRole('button', { name: '국밥' })).toBeVisible()
    expect(within(korean).getByRole('button', { name: '냉면' })).toBeVisible()
    expect(
      within(screen.getByRole('group', { name: '중식' })).getByRole('button', {
        name: '짜장면',
      }),
    ).toBeVisible()
  })

  it('대분류와 메뉴를 누르면 그 이름을 알린다', async () => {
    const { user, onToggleCuisine, onToggleMenu } = renderFilter()

    await user.click(screen.getByRole('button', { name: '중식 전체' }))
    await user.click(screen.getByRole('button', { name: '국밥' }))

    expect(onToggleCuisine).toHaveBeenCalledWith('중식')
    expect(onToggleMenu).toHaveBeenCalledWith('국밥', '한식')
  })

  it('제외한 메뉴는 눌린 상태로 보여준다', () => {
    renderFilter({ cuisines: [], menus: ['국밥'], includedMenus: {} })

    expect(screen.getByRole('button', { name: '국밥' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '냉면' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('대분류를 통째로 빼면 그 안의 메뉴도 제외된 것으로 보여준다', () => {
    renderFilter({ cuisines: ['한식'], menus: [], includedMenus: {} })

    expect(screen.getByRole('button', { name: '한식 전체' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const menu of ['국밥', '냉면']) {
      expect(screen.getByRole('button', { name: menu })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
    expect(screen.getByRole('button', { name: '짜장면' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('뺀 대분류의 메뉴를 누르면 그 대분류와 함께 알린다', async () => {
    const { user, onToggleMenu } = renderFilter({
      cuisines: ['한식'],
      menus: [],
      includedMenus: {},
    })

    await user.click(screen.getByRole('button', { name: '냉면' }))

    expect(onToggleMenu).toHaveBeenCalledWith('냉면', '한식')
  })

  it('뺀 대분류 안에서 예외로 다시 넣은 메뉴는 제외되지 않은 것으로 보여준다', () => {
    renderFilter({
      cuisines: ['한식'],
      menus: [],
      includedMenus: { 한식: ['국밥'] },
    })

    expect(screen.getByRole('button', { name: '국밥' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: '냉면' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
