import { useCallback, useEffect, useState } from 'react'

export const STORAGE_KEY = 'menu-pick:exclusions'

export type MenuExclusions = {
  /** 통째로 뺀 대분류 (예: 중식). */
  cuisines: string[]
  /** 하나씩 골라 뺀 메뉴 (예: 국밥). */
  menus: string[]
  /**
   * 대분류를 통째로 뺐어도 예외로 다시 넣은 메뉴 (예: { 한식: ['국밥'] }).
   * 대분류별로 나눠 두어야, 대분류 제외를 풀 때 그 예외만 함께 지워서
   * 나중에 다시 뺐을 때 옛 예외가 되살아나지 않는다.
   */
  includedMenus: Record<string, string[]>
}

const EMPTY: MenuExclusions = { cuisines: [], menus: [], includedMenus: {} }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isIncludedMenus(value: unknown): value is Record<string, string[]> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isStringArray)
  )
}

/**
 * 저장된 값이 깨졌으면 고칠 방법이 없으니 빈 설정으로 시작한다.
 * 사생활 보호 모드처럼 저장소를 못 쓰는 브라우저도 마찬가지다.
 * 예외 메뉴가 생기기 전에 저장한 값에는 includedMenus가 없으니, 예외 없이 그대로 불러온다.
 * includedMenus만 깨졌을 때도 애써 고른 제외 설정까지 버리지 않도록 예외만 비운다.
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
      const includedMenus =
        'includedMenus' in stored && isIncludedMenus(stored.includedMenus)
          ? stored.includedMenus
          : {}
      return { cuisines: stored.cuisines, menus: stored.menus, includedMenus }
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

function withoutKey(
  record: Record<string, string[]>,
  key: string,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(record).filter(([name]) => name !== key),
  )
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
    setExclusions((current) => {
      const excluding = !current.cuisines.includes(cuisine)
      return {
        ...current,
        cuisines: toggle(current.cuisines, cuisine),
        // 제외를 풀면 그 대분류의 예외도 의미가 없어지니 함께 지운다.
        includedMenus: excluding
          ? current.includedMenus
          : withoutKey(current.includedMenus, cuisine),
      }
    })
  }, [])

  /**
   * 메뉴가 속한 대분류를 통째로 뺀 상태면 그 안에서 예외로 다시 넣거나 빼고,
   * 아니면 그 메뉴 하나만 빼거나 다시 넣는다.
   */
  const toggleMenu = useCallback((menu: string, cuisine: string) => {
    setExclusions((current) => {
      if (!current.cuisines.includes(cuisine)) {
        return { ...current, menus: toggle(current.menus, menu) }
      }
      const included = toggle(current.includedMenus[cuisine] ?? [], menu)
      return {
        ...current,
        // 예외가 하나도 안 남으면 빈 목록 대신 키를 지워 저장 값을 깔끔하게 둔다.
        includedMenus:
          included.length > 0
            ? { ...current.includedMenus, [cuisine]: included }
            : withoutKey(current.includedMenus, cuisine),
      }
    })
  }, [])

  return { exclusions, toggleCuisine, toggleMenu }
}
