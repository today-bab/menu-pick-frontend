import { useEffect, useState } from 'react'
import {
  CustomOverlayMap,
  Map as KakaoMap,
  MapMarker,
  useKakaoLoader,
} from 'react-kakao-maps-sdk'
import type { Restaurant } from '../api/types'
import type { Coordinates } from '../location/useGeolocation'

type RestaurantMapProps = {
  /** 가게가 없을 때 지도 가운데에 둘 곳. */
  center: Coordinates
  /** 내 위치. 모르면 null이고 내 위치 점을 그리지 않는다. */
  me: Coordinates | null
  restaurants: Restaurant[]
  selected: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
}

const mapBox = 'h-72 w-full overflow-hidden rounded-xl'

export function RestaurantMap({
  center,
  me,
  restaurants,
  selected,
  onSelect,
}: RestaurantMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
  })
  const [map, setMap] = useState<kakao.maps.Map>()

  // 새로 뽑을 때마다 내 위치와 가게가 모두 보이게 맞춘다.
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
    map.setBounds(bounds)
  }, [map, center, me, restaurants])

  useEffect(() => {
    if (map && selected) {
      map.panTo(new kakao.maps.LatLng(selected.lat, selected.lng))
    }
  }, [map, selected])

  if (error) {
    return (
      <div
        className={`${mapBox} flex items-center justify-center bg-neutral-100 text-sm text-neutral-500`}
      >
        지도를 불러오지 못했어요.
      </div>
    )
  }
  if (loading) {
    return <div className={`${mapBox} animate-pulse bg-neutral-100`} />
  }

  return (
    <KakaoMap center={center} level={5} onCreate={setMap} className={mapBox}>
      {me && (
        <CustomOverlayMap position={me}>
          <div
            aria-label="내 위치"
            className="size-4 rounded-full border-2 border-white bg-blue-500 shadow"
          />
        </CustomOverlayMap>
      )}

      {restaurants.map((restaurant) => (
        <MapMarker
          key={restaurant.placeUrl}
          position={restaurant}
          title={restaurant.name}
          clickable
          onClick={() => onSelect(restaurant)}
          zIndex={restaurant === selected ? 1 : 0}
        />
      ))}

      {selected && (
        <CustomOverlayMap position={selected} yAnchor={2.4} zIndex={2}>
          <div className="rounded-lg bg-orange-500 px-3 py-1 text-sm font-semibold text-white shadow">
            {selected.name}
          </div>
        </CustomOverlayMap>
      )}
    </KakaoMap>
  )
}
