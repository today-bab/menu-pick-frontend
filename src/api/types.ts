export type Restaurant = {
  name: string
  distanceMeters: number
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
}

export type PickErrorKind =
  'invalid-location' | 'no-restaurants' | 'upstream' | 'network' | 'unknown'

export class PickError extends Error {
  readonly kind: PickErrorKind

  constructor(kind: PickErrorKind) {
    super(`메뉴 뽑기 실패: ${kind}`)
    this.name = 'PickError'
    this.kind = kind
  }
}
