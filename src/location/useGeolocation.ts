import { useCallback, useRef, useState } from 'react'

export type Coordinates = {
  lat: number
  lng: number
}

export type GeolocationStatus =
  'idle' | 'locating' | 'located' | 'denied' | 'unavailable' | 'unsupported'

// GeolocationPositionError.PERMISSION_DENIED
const PERMISSION_DENIED = 1

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10_000,
      maximumAge: 60_000,
    })
  })
}

/**
 * 현재 위치를 요청할 때 조회한다. 한 번 성공하면 같은 좌표를 다시 쓴다.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const coordinatesRef = useRef<Coordinates | null>(null)

  const locate = useCallback(async (): Promise<Coordinates | null> => {
    if (coordinatesRef.current) {
      return coordinatesRef.current
    }
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return null
    }

    setStatus('locating')
    try {
      const { coords } = await getCurrentPosition()
      coordinatesRef.current = { lat: coords.latitude, lng: coords.longitude }
      setStatus('located')
      return coordinatesRef.current
    } catch (error) {
      const denied =
        (error as GeolocationPositionError).code === PERMISSION_DENIED
      setStatus(denied ? 'denied' : 'unavailable')
      return null
    }
  }, [])

  return { status, locate }
}
