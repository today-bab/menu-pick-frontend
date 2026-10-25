import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PickResult } from '../api/types'
import { MAX_HISTORY, usePickHistory } from './usePickHistory'

function pick(menu: string): PickResult {
  return { menu, restaurants: [] }
}

function renderHistory(...menus: string[]) {
  const hook = renderHook(() => usePickHistory())
  for (const menu of menus) {
    act(() => hook.result.current.add(pick(menu)))
  }
  return hook.result
}

describe('usePickHistory', () => {
  it('처음에는 보여줄 결과가 없고 어느 쪽으로도 갈 수 없다', () => {
    const result = renderHistory()

    expect(result.current.current).toBeNull()
    expect(result.current.canBack).toBe(false)
    expect(result.current.canForward).toBe(false)
  })

  it('결과를 더하면 마지막 결과를 보여준다', () => {
    const result = renderHistory('냉면', '돈까스')

    expect(result.current.entries.map(({ menu }) => menu)).toEqual([
      '냉면',
      '돈까스',
    ])
    expect(result.current.current?.menu).toBe('돈까스')
    expect(result.current.canBack).toBe(true)
    expect(result.current.canForward).toBe(false)
  })

  it('뒤로 갔다가 앞으로 다시 갈 수 있다', () => {
    const result = renderHistory('냉면', '돈까스', '국밥')

    act(() => result.current.back())
    act(() => result.current.back())
    expect(result.current.current?.menu).toBe('냉면')
    expect(result.current.canBack).toBe(false)
    expect(result.current.canForward).toBe(true)

    act(() => result.current.forward())
    expect(result.current.current?.menu).toBe('돈까스')
    expect(result.current.canBack).toBe(true)
    expect(result.current.canForward).toBe(true)
  })

  it('양 끝에서 더 가려고 하면 그대로 있는다', () => {
    const result = renderHistory('냉면', '돈까스')

    act(() => result.current.forward())
    expect(result.current.current?.menu).toBe('돈까스')

    act(() => result.current.back())
    act(() => result.current.back())
    expect(result.current.current?.menu).toBe('냉면')
    expect(result.current.index).toBe(0)
  })

  it('뒤로 간 상태에서 결과를 더하면 그 뒤의 결과는 버린다', () => {
    const result = renderHistory('냉면', '돈까스', '국밥')

    act(() => result.current.back())
    act(() => result.current.back())
    act(() => result.current.add(pick('초밥')))

    expect(result.current.entries.map(({ menu }) => menu)).toEqual([
      '냉면',
      '초밥',
    ])
    expect(result.current.current?.menu).toBe('초밥')
    expect(result.current.canForward).toBe(false)
  })

  it(`최근 ${MAX_HISTORY}개까지만 남긴다`, () => {
    const menus = Array.from(
      { length: MAX_HISTORY + 2 },
      (_, index) => `${index}`,
    )
    const result = renderHistory(...menus)

    expect(result.current.entries).toHaveLength(MAX_HISTORY)
    expect(result.current.entries[0].menu).toBe('2')
    expect(result.current.current?.menu).toBe(`${MAX_HISTORY + 1}`)
    expect(result.current.index).toBe(MAX_HISTORY - 1)
  })
})
