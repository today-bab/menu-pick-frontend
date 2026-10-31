import type { Coordinates } from '../location/useGeolocation'
import type { MenuCategory } from './types'

type MenuCategoriesResponse = {
  categories: MenuCategory[]
}

function categoriesUrl({ lat, lng }: Coordinates): URL {
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  const url = new URL('/api/menus/categories', base)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lng', String(lng))
  return url
}

/**
 * 근처 음식점의 대분류와 메뉴를 가져온다.
 * 화면은 실패 이유와 상관없이 제외 설정만 숨기면 되므로 오류를 종류별로 나누지 않는다.
 */
export async function fetchMenuCategories(
  coordinates: Coordinates,
): Promise<MenuCategory[]> {
  const response = await fetch(categoriesUrl(coordinates))
  if (!response.ok) {
    throw new Error(`메뉴 카테고리 조회 실패: ${response.status}`)
  }
  const { categories }: MenuCategoriesResponse = await response.json()
  return categories
}
