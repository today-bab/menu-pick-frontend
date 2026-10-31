import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, useMenuExclusions } from './useMenuExclusions'

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
}

const empty = { cuisines: [], menus: [], includedMenus: {} }

afterEach(() => {
  localStorage.clear()
})

describe('useMenuExclusions', () => {
  it('저장된 것이 없으면 아무것도 제외하지 않는다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual(empty)
  })

  it('대분류와 메뉴를 누를 때마다 제외했다가 다시 풀고 저장한다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    act(() => result.current.toggleCuisine('중식'))
    act(() => result.current.toggleCuisine('일식'))
    act(() => result.current.toggleMenu('국밥', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['중식', '일식'],
      menus: ['국밥'],
      includedMenus: {},
    })
    expect(stored()).toEqual({
      cuisines: ['중식', '일식'],
      menus: ['국밥'],
      includedMenus: {},
    })

    act(() => result.current.toggleCuisine('중식'))
    act(() => result.current.toggleMenu('국밥', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['일식'],
      menus: [],
      includedMenus: {},
    })
    expect(stored()).toEqual({
      cuisines: ['일식'],
      menus: [],
      includedMenus: {},
    })
  })

  it('뺀 대분류의 메뉴를 누르면 예외로 다시 넣었다가 다시 누르면 뺀다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    act(() => result.current.toggleCuisine('한식'))
    act(() => result.current.toggleMenu('국밥', '한식'))
    act(() => result.current.toggleMenu('냉면', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: { 한식: ['국밥', '냉면'] },
    })
    expect(stored()).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: { 한식: ['국밥', '냉면'] },
    })

    act(() => result.current.toggleMenu('국밥', '한식'))
    act(() => result.current.toggleMenu('냉면', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: {},
    })
  })

  it('따로 뺐던 메뉴도 대분류를 뺀 뒤 누르면 한 번에 다시 넣는다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    act(() => result.current.toggleMenu('국밥', '한식'))
    act(() => result.current.toggleCuisine('한식'))
    act(() => result.current.toggleMenu('국밥', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: { 한식: ['국밥'] },
    })

    act(() => result.current.toggleMenu('국밥', '한식'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: {},
    })
  })

  it('대분류 제외를 풀면 그 대분류의 예외만 지워서 다시 빼도 되살아나지 않는다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    act(() => result.current.toggleCuisine('한식'))
    act(() => result.current.toggleCuisine('중식'))
    act(() => result.current.toggleMenu('국밥', '한식'))
    act(() => result.current.toggleMenu('짜장면', '중식'))

    act(() => result.current.toggleCuisine('한식'))
    expect(result.current.exclusions.includedMenus).toEqual({
      중식: ['짜장면'],
    })

    act(() => result.current.toggleCuisine('한식'))
    expect(result.current.exclusions.includedMenus).toEqual({
      중식: ['짜장면'],
    })
  })

  it('다시 접속하면 저장해 둔 제외 설정을 불러온다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cuisines: ['양식', '한식'],
        menus: ['냉면'],
        includedMenus: { 한식: ['국밥'] },
      }),
    )

    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual({
      cuisines: ['양식', '한식'],
      menus: ['냉면'],
      includedMenus: { 한식: ['국밥'] },
    })
  })

  it('예외 메뉴가 없던 예전 형식도 예외 없이 그대로 불러온다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cuisines: ['양식'], menus: ['냉면'] }),
    )

    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual({
      cuisines: ['양식'],
      menus: ['냉면'],
      includedMenus: {},
    })
  })

  it.each([
    ['배열', ['국밥']],
    ['문자열 목록이 아닌 값', { 한식: '국밥' }],
    ['null', null],
  ])('예외 메뉴만 %s로 깨졌으면 예외만 비운다', (_, value) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cuisines: ['한식'], menus: [], includedMenus: value }),
    )

    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual({
      cuisines: ['한식'],
      menus: [],
      includedMenus: {},
    })
  })

  it.each([
    ['JSON이 아닌 값', '{깨진 값'],
    ['형식이 다른 값', JSON.stringify({ cuisines: '중식', menus: [] })],
    ['문자열이 아닌 항목', JSON.stringify({ cuisines: [1], menus: [] })],
    ['객체가 아닌 값', JSON.stringify(['중식'])],
  ])('저장된 값이 %s이면 빈 설정으로 시작한다', (_, value) => {
    localStorage.setItem(STORAGE_KEY, value)

    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual(empty)
  })
})
