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
  me: Coordinates
  restaurants: Restaurant[]
  selected: Restaurant | null
  onSelect: (restaurant: Restaurant) => void
}

const mapBox = 'h-72 w-full overflow-hidden rounded-xl'

export function RestaurantMap({
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
    // 점이 하나뿐이면 setBounds가 최대로 확대해 버려서 내 위치만 가운데 둔다.
    if (restaurants.length === 0) {
      map.setCenter(new kakao.maps.LatLng(me.lat, me.lng))
      return
    }
    const bounds = new kakao.maps.LatLngBounds()
    for (const { lat, lng } of [me, ...restaurants]) {
      bounds.extend(new kakao.maps.LatLng(lat, lng))
    }
    map.setBounds(bounds)
  }, [map, me, restaurants])

  useEffect(() => {
    if (map && selected) {
      map.panTo(new kakao.maps.LatLng(selected.lat, selected.lng))
    }
  }, [map, selected])

  if (error) {
    return (
      <div
        className={`${mapBox} flex items-center justify-center bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900`}
      >
        지도를 불러오지 못했어요.
      </div>
    )
  }
  if (loading) {
    return (
      <div
        className={`${mapBox} animate-pulse bg-neutral-100 dark:bg-neutral-900`}
      />
    )
  }

  return (
    <KakaoMap center={me} level={5} onCreate={setMap} className={mapBox}>
      <CustomOverlayMap position={me}>
        <div
          aria-label="내 위치"
          className="size-4 rounded-full border-2 border-white bg-blue-500 shadow"
        />
      </CustomOverlayMap>

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
