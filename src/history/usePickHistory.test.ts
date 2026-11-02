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
  it('처음에는 보여줄 결과가 없다', () => {
    const result = renderHistory()

    expect(result.current.current).toBeNull()
    expect(result.current.entries).toEqual([])
  })

  it('결과를 더하면 마지막 결과를 보여준다', () => {
    const result = renderHistory('냉면', '돈까스')

    expect(result.current.entries.map(({ menu }) => menu)).toEqual([
      '냉면',
      '돈까스',
    ])
    expect(result.current.current?.menu).toBe('돈까스')
  })

  it('이전 기록을 보는 중에 결과를 더해도 기록을 버리지 않고 맨 뒤에 더한다', () => {
    const result = renderHistory('냉면', '돈까스', '국밥')

    act(() => result.current.select(0))
    act(() => result.current.add(pick('초밥')))

    expect(result.current.entries.map(({ menu }) => menu)).toEqual([
      '냉면',
      '돈까스',
      '국밥',
      '초밥',
    ])
    expect(result.current.current?.menu).toBe('초밥')
    expect(result.current.index).toBe(3)
  })

  it('기록 중 하나를 골라 그 결과를 보여준다', () => {
    const result = renderHistory('냉면', '돈까스', '국밥')

    act(() => result.current.select(1))

    expect(result.current.current?.menu).toBe('돈까스')
    expect(result.current.index).toBe(1)
  })

  it('없는 기록을 고르면 그대로 있는다', () => {
    const result = renderHistory('냉면', '돈까스')

    act(() => result.current.select(5))
    act(() => result.current.select(-1))

    expect(result.current.current?.menu).toBe('돈까스')
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
