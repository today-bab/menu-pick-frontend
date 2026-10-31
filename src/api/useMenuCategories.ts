import { skipToken, useQuery } from '@tanstack/react-query'
import type { Coordinates } from '../location/useGeolocation'
import { fetchMenuCategories } from './menuCategories'

/**
 * 위치를 알게 되면 그 근처의 대분류와 메뉴를 조회한다.
 * 실패하면 제외 설정을 숨기기만 하면 돼서 다시 시도하지 않는다.
 * (서버가 아직 이 기능을 모르면 매번 404가 나므로 재시도는 낭비다.)
 */
export function useMenuCategories(coordinates: Coordinates | null) {
  return useQuery({
    queryKey: ['menu-categories', coordinates?.lat, coordinates?.lng],
    // 위치를 모르는 동안에는 조회하지 않는다.
    queryFn: coordinates ? () => fetchMenuCategories(coordinates) : skipToken,
    retry: false,
    // 같은 자리에서 근처 가게 종류가 금방 바뀌지 않아 다시 받아 올 필요가 없다.
    staleTime: Infinity,
  })
}
