import { useCallback, useState } from 'react'
import type { PickResult } from '../api/types'

// 오래된 결과까지 다 쥐고 있을 필요는 없어 최근 것만 남긴다.
export const MAX_HISTORY = 20

type History = {
  entries: PickResult[]
  index: number
}

/**
 * 뽑은 결과를 브라우저 뒤로/앞으로처럼 오갈 수 있게 메모리에 쌓는다.
 * 이전 결과를 보는 중에 새로 뽑으면 그 뒤의 결과는 버린다.
 */
export function usePickHistory() {
  const [{ entries, index }, setHistory] = useState<History>({
    entries: [],
    index: -1,
  })

  const add = useCallback((result: PickResult) => {
    setHistory(({ entries, index }) => {
      const next = [...entries.slice(0, index + 1), result].slice(-MAX_HISTORY)
      return { entries: next, index: next.length - 1 }
    })
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
    back,
    forward,
  }
}
