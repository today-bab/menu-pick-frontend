import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, useMenuExclusions } from './useMenuExclusions'

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
}

afterEach(() => {
  localStorage.clear()
})

describe('useMenuExclusions', () => {
  it('저장된 것이 없으면 아무것도 제외하지 않는다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual({ cuisines: [], menus: [] })
  })

  it('대분류와 메뉴를 누를 때마다 제외했다가 다시 풀고 저장한다', () => {
    const { result } = renderHook(() => useMenuExclusions())

    act(() => result.current.toggleCuisine('중식'))
    act(() => result.current.toggleCuisine('일식'))
    act(() => result.current.toggleMenu('국밥'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['중식', '일식'],
      menus: ['국밥'],
    })
    expect(stored()).toEqual({ cuisines: ['중식', '일식'], menus: ['국밥'] })

    act(() => result.current.toggleCuisine('중식'))
    act(() => result.current.toggleMenu('국밥'))
    expect(result.current.exclusions).toEqual({
      cuisines: ['일식'],
      menus: [],
    })
    expect(stored()).toEqual({ cuisines: ['일식'], menus: [] })
  })

  it('다시 접속하면 저장해 둔 제외 설정을 불러온다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cuisines: ['양식'], menus: ['냉면'] }),
    )

    const { result } = renderHook(() => useMenuExclusions())

    expect(result.current.exclusions).toEqual({
      cuisines: ['양식'],
      menus: ['냉면'],
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

    expect(result.current.exclusions).toEqual({ cuisines: [], menus: [] })
  })
})
