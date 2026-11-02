import { useEffect, useState } from 'react'
import {
  CustomOverlayMap,
  Map as KakaoMap,
  useKakaoLoader,
} from 'react-kakao-maps-sdk'
import type { Restaurant } from '../api/types'
import type { Coordinates } from '../location/useGeolocation'
import { MapPin, MeDot } from './MapPin'

/** 지도 가장자리 중 시트·버튼에 가려지는 만큼의 여백(px). */
export type MapPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

type RestaurantMapProps = {
  /** 가게가 없을 때 지도 가운데에 둘 곳. */
  center: Coordinates
  /** 내 위치. 모르면 null이고 내 위치 점을 그리지 않는다. */
  me: Coordinates | null
  restaurants: Restaurant[]
  selected: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
  /** 가려진 가장자리를 피해, 보이는 영역 안에 가게들이 들어오게 맞춘다. */
  padding?: MapPadding
}

const NO_PADDING: MapPadding = { top: 32, right: 32, bottom: 32, left: 32 }

/**
 * 부모를 꽉 채우는 카카오 지도. 내 위치와 근처 가게를 보여주고, 핀을 누르면 가게를 고른다.
 */
export function RestaurantMap({
  center,
  me,
  restaurants,
  selected,
  onSelect,
  padding = NO_PADDING,
}: RestaurantMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
  })
  const [map, setMap] = useState<kakao.maps.Map>()
  const { top, right, bottom, left } = padding

  // 새로 뽑을 때마다 내 위치와 가게가 모두 보이는 영역 안에 들어오게 맞춘다.
  useEffect(() => {
    if (!map) {
      return
    }
    // 점이 하나뿐이면 setBounds가 최대로 확대해 버려서 가운데만 맞춘다.
    if (restaurants.length === 0) {
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng))
      return
    }
    const bounds = new kakao.maps.LatLngBounds()
    for (const { lat, lng } of me ? [me, ...restaurants] : restaurants) {
      bounds.extend(new kakao.maps.LatLng(lat, lng))
    }
    map.setBounds(bounds, top + 24, right + 24, bottom + 24, left + 24)
  }, [map, center, me, restaurants, top, right, bottom, left])

  // 고른 가게가 시트에 가려 있으면 보이는 영역 가운데로 옮긴다.
  useEffect(() => {
    if (!map || !selected) {
      return
    }
    const projection = map.getProjection()
    const pin = projection.containerPointFromCoords(
      new kakao.maps.LatLng(selected.lat, selected.lng),
    )
    const { clientWidth: width, clientHeight: height } = map.getNode()
    const visible =
      pin.x >= left &&
      pin.x <= width - right &&
      pin.y >= top &&
      pin.y <= height - bottom
    if (visible) {
      return
    }
    const now = projection.containerPointFromCoords(map.getCenter())
    const visibleCenterX = left + (width - left - right) / 2
    const visibleCenterY = top + (height - top - bottom) / 2
    map.panTo(
      projection.coordsFromContainerPoint(
        new kakao.maps.Point(
          now.x + pin.x - visibleCenterX,
          now.y + pin.y - visibleCenterY,
        ),
      ),
    )
  }, [map, selected, top, right, bottom, left])

  if (error) {
    return (
      <div className="flex size-full items-center justify-center bg-map-bg text-sm text-gray-500">
        지도를 불러오지 못했어요.
      </div>
    )
  }
  if (loading) {
    return <div className="size-full animate-pulse bg-map-bg" />
  }

  return (
    <KakaoMap center={center} level={5} onCreate={setMap} className="size-full">
      {me && (
        <CustomOverlayMap position={me} zIndex={1}>
          <MeDot />
        </CustomOverlayMap>
      )}

      {restaurants.map((restaurant) => {
        const isSelected = restaurant === selected
        return (
          <CustomOverlayMap
            key={restaurant.placeUrl}
            position={restaurant}
            zIndex={isSelected ? 3 : 2}
          >
            <MapPin
              name={restaurant.name}
              selected={isSelected}
              onClick={() => onSelect(restaurant)}
            />
          </CustomOverlayMap>
        )
      })}
    </KakaoMap>
  )
}
