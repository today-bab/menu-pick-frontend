import {
  PickError,
  type PickErrorKind,
  type PickRequest,
  type PickResult,
} from './types'

const errorKindByStatus: Record<number, PickErrorKind> = {
  400: 'invalid-location',
  404: 'no-restaurants',
  // 제외한 것을 빼면 고를 메뉴가 하나도 남지 않을 때
  422: 'all-excluded',
  502: 'upstream',
}

function pickUrl({
  lat,
  lng,
  exclude,
  excludedCuisines = [],
  excludedMenus = [],
  includedMenus = [],
}: PickRequest): URL {
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  const url = new URL('/api/menus/pick', base)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lng', String(lng))
  if (exclude) {
    url.searchParams.set('exclude', exclude)
  }
  // 서버는 같은 이름의 파라미터를 여러 번 받아 목록으로 읽는다.
  for (const cuisine of excludedCuisines) {
    url.searchParams.append('excludeCuisine', cuisine)
  }
  for (const menu of excludedMenus) {
    url.searchParams.append('excludeMenu', menu)
  }
  for (const menu of includedMenus) {
    url.searchParams.append('includeMenu', menu)
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
