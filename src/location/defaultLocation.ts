import type { Coordinates } from './useGeolocation'

/** 내 위치를 모를 때(권한 거부, 조회 실패 등) 지도 가운데에 둘 곳. 서울시청. */
export const DEFAULT_LOCATION: Coordinates = { lat: 37.5665, lng: 126.978 }
