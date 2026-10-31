export type Restaurant = {
  name: string
  distanceMeters: number
  lat: number
  lng: number
  placeUrl: string
}

export type PickResult = {
  menu: string
  restaurants: Restaurant[]
}

/** 대분류(예: 한식)와 그 안에서 근처에 있는 메뉴들. */
export type MenuCategory = {
  name: string
  menus: string[]
}

export type PickRequest = {
  lat: number
  lng: number
  exclude?: string
  /** 통째로 빼고 싶은 대분류 (예: 중식). */
  excludedCuisines?: string[]
  /** 하나씩 골라 뺀 메뉴 (예: 국밥). */
  excludedMenus?: string[]
}

export type PickErrorKind =
  | 'invalid-location'
  | 'no-restaurants'
  | 'all-excluded'
  | 'upstream'
  | 'network'
  | 'unknown'

export class PickError extends Error {
  readonly kind: PickErrorKind

  constructor(kind: PickErrorKind) {
    super(`메뉴 뽑기 실패: ${kind}`)
    this.name = 'PickError'
    this.kind = kind
  }
}
