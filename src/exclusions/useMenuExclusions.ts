import { useCallback, useEffect, useState } from 'react'

export const STORAGE_KEY = 'menu-pick:exclusions'

export type MenuExclusions = {
  /** 통째로 뺀 대분류 (예: 중식). */
  cuisines: string[]
  /** 하나씩 골라 뺀 메뉴 (예: 국밥). */
  menus: string[]
}

const EMPTY: MenuExclusions = { cuisines: [], menus: [] }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/**
 * 저장된 값이 깨졌거나 예전 형식이면 고칠 방법이 없으니 빈 설정으로 시작한다.
 * 사생활 보호 모드처럼 저장소를 못 쓰는 브라우저도 마찬가지다.
 */
function load(): MenuExclusions {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')
    if (
      typeof stored === 'object' &&
      stored !== null &&
      'cuisines' in stored &&
      'menus' in stored &&
      isStringArray(stored.cuisines) &&
      isStringArray(stored.menus)
    ) {
      return { cuisines: stored.cuisines, menus: stored.menus }
    }
  } catch {
    // 아래에서 빈 설정을 돌려준다.
  }
  return EMPTY
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item]
}

/**
 * 추천에서 뺄 대분류와 메뉴를 고르고, 다음에 와도 그대로 남도록 브라우저에 저장한다.
 */
export function useMenuExclusions() {
  const [exclusions, setExclusions] = useState<MenuExclusions>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exclusions))
    } catch {
      // 저장하지 못해도 이번 접속 동안은 메모리의 설정으로 동작한다.
    }
  }, [exclusions])

  const toggleCuisine = useCallback((cuisine: string) => {
    setExclusions((current) => ({
      ...current,
      cuisines: toggle(current.cuisines, cuisine),
    }))
  }, [])

  const toggleMenu = useCallback((menu: string) => {
    setExclusions((current) => ({
      ...current,
      menus: toggle(current.menus, menu),
    }))
  }, [])

  return { exclusions, toggleCuisine, toggleMenu }
}
