import { useCallback, useState } from 'react'
import type { PickResult } from '../api/types'

// 오래된 결과까지 다 쥐고 있을 필요는 없어 최근 것만 남긴다.
export const MAX_HISTORY = 20

type History = {
  entries: PickResult[]
  index: number
}

/**
 * 이번 방문에서 뽑은 결과를 메모리에 쌓는다 (새로고침하면 사라진다).
 * 이전 결과를 보는 중에 새로 뽑아도 기록은 버리지 않고 맨 뒤에 더한다.
 */
export function usePickHistory() {
  const [{ entries, index }, setHistory] = useState<History>({
    entries: [],
    index: -1,
  })

  const add = useCallback((result: PickResult) => {
    setHistory(({ entries }) => {
      const next = [...entries, result].slice(-MAX_HISTORY)
      return { entries: next, index: next.length - 1 }
    })
  }, [])

  const select = useCallback((target: number) => {
    setHistory((history) =>
      target >= 0 && target < history.entries.length
        ? { ...history, index: target }
        : history,
    )
  }, [])

  const back = useCallback(() => {
    setHistory((history) =>
      history.index > 0 ? { ...history, index: history.index - 1 } : history,
    )
  }, [])

  const forward = useCallback(() => {
    setHistory((history) =>
      history.index < history.entries.length - 1
        ? { ...history, index: history.index + 1 }
        : history,
    )
  }, [])

  return {
    entries,
    index,
    current: entries[index] ?? null,
    canBack: index > 0,
    canForward: index < entries.length - 1,
    add,
    select,
    back,
    forward,
  }
}
