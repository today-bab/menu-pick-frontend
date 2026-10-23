import {
  PickError,
  type PickErrorKind,
  type PickRequest,
  type PickResult,
} from './types'

const errorKindByStatus: Record<number, PickErrorKind> = {
  400: 'invalid-location',
  404: 'no-restaurants',
  502: 'upstream',
}

function pickUrl({ lat, lng, exclude }: PickRequest): URL {
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  const url = new URL('/api/menus/pick', base)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lng', String(lng))
  if (exclude) {
    url.searchParams.set('exclude', exclude)
  }
  return url
}

export async function pickMenu(request: PickRequest): Promise<PickResult> {
  let response: Response
  try {
    response = await fetch(pickUrl(request))
  } catch {
    throw new PickError('network')
  }

  if (!response.ok) {
    throw new PickError(errorKindByStatus[response.status] ?? 'unknown')
  }
  return response.json()
}
