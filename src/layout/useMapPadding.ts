import { useEffect, useState } from 'react'
import type { MapPadding } from '../components/RestaurantMap'

/** 이 폭부터 아래 시트 대신 왼쪽 패널로 보여준다 (Tailwind `lg`). */
export const WIDE_QUERY = '(min-width: 1024px)'

const EDGE = 16
// 지도 위쪽에 떠 있는 서비스 이름과 기록·제외 버튼이 차지하는 높이.
const TOP_BAR = 64

const DEFAULT_PADDING: MapPadding = {
  top: TOP_BAR,
  right: EDGE,
  bottom: EDGE,
  left: EDGE,
}

/**
 * 지도 위에 겹쳐 놓인 시트(넓은 화면에서는 왼쪽 패널)의 크기를 재서,
 * 지도가 가려진 가장자리를 피해 가게를 보여줄 수 있게 여백을 돌려준다.
 */
export function useMapPadding() {
  const [sheet, setSheet] = useState<HTMLElement | null>(null)
  const [padding, setPadding] = useState<MapPadding>(DEFAULT_PADDING)

  useEffect(() => {
    if (!sheet || typeof ResizeObserver === 'undefined') {
      return
    }
    const wide = window.matchMedia?.(WIDE_QUERY)
    const update = () => {
      const { width, height } = sheet.getBoundingClientRect()
      setPadding(
        wide?.matches
          ? { top: EDGE, right: EDGE, bottom: EDGE, left: width }
          : { top: TOP_BAR, right: EDGE, bottom: height, left: EDGE },
      )
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(sheet)
    wide?.addEventListener('change', update)
    return () => {
      observer.disconnect()
      wide?.removeEventListener('change', update)
    }
  }, [sheet])

  return { sheetRef: setSheet, padding }
}
