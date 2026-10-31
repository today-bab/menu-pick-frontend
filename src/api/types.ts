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
