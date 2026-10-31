import { delay, http, HttpResponse } from 'msw'
import type { MenuCategory, PickResult, Restaurant } from '../api/types'

type FakeRestaurant = {
  name: string
  distanceMeters: number
}

type FakeMenu = {
  cuisine: string
  menu: string
  restaurants: FakeRestaurant[]
}

const METERS_PER_DEGREE = 111_320

function restaurant(name: string, distanceMeters: number): FakeRestaurant {
  return { name, distanceMeters }
}

export const fakeMenus: FakeMenu[] = [
  {
    cuisine: '한식',
    menu: '냉면',
    restaurants: [restaurant('평양면옥', 210), restaurant('함흥냉면', 540)],
  },
  {
    cuisine: '일식',
    menu: '돈까스',
    restaurants: [restaurant('카츠정', 130), restaurant('오늘돈까스', 760)],
  },
  {
    cuisine: '한식',
    menu: '국밥',
    restaurants: [
      restaurant('할매순대국', 90),
      restaurant('돼지국밥집', 320),
      restaurant('소머리국밥', 880),
    ],
  },
  {
    cuisine: '중식',
    menu: '짜장면',
    restaurants: [restaurant('홍콩반점', 260), restaurant('만리장성', 610)],
  },
  { cuisine: '일식', menu: '초밥', restaurants: [restaurant('스시하루', 450)] },
  {
    cuisine: '양식',
    menu: '햄버거',
    restaurants: [restaurant('버거하우스', 180), restaurant('수제버거랩', 930)],
  },
  {
    cuisine: '아시아음식',
    menu: '쌀국수',
    restaurants: [restaurant('포베트남', 370)],
  },
  {
    cuisine: '분식',
    menu: '떡볶이',
    restaurants: [restaurant('엽기분식', 150), restaurant('신당동떡볶이', 690)],
  },
  {
    cuisine: '양식',
    menu: '파스타',
    restaurants: [restaurant('트라토리아', 520)],
  },
]

/** 실제 서버처럼 대분류별로 메뉴를 묶는다. 순서는 처음 나온 순서를 따른다. */
function groupByCuisine(menus: FakeMenu[]): MenuCategory[] {
  const categories = new Map<string, string[]>()
  for (const { cuisine, menu } of menus) {
    categories.set(cuisine, [...(categories.get(cuisine) ?? []), menu])
  }
  return [...categories].map(([name, menus]) => ({ name, menus }))
}

/**
 * 요청한 위치에서 거리만큼 떨어진 곳에 가짜 가게를 놓는다.
 * 방향은 가게마다 다르게 해서 지도에서 핀이 겹치지 않게 한다.
 */
function placeAround(
  { menu, restaurants }: FakeMenu,
  lat: number,
  lng: number,
): PickResult {
  return {
    menu,
    restaurants: restaurants.map(
      ({ name, distanceMeters }, index): Restaurant => {
        const bearing = ((index * 137 + menu.length * 50) * Math.PI) / 180
        const north = distanceMeters * Math.cos(bearing)
        const east = distanceMeters * Math.sin(bearing)
        const placeLat = lat + north / METERS_PER_DEGREE
        const placeLng =
          lng + east / (METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180))
        return {
          name,
          distanceMeters,
          lat: placeLat,
          lng: placeLng,
          // 가짜 가게라 상세 페이지가 없어, 화면 지도와 같은 좌표에 핀을 찍는 링크를 쓴다.
          placeUrl: `https://map.kakao.com/link/map/${encodeURIComponent(name)},${placeLat},${placeLng}`,
        }
      },
    ),
  }
}

export const handlers = [
  http.get('*/api/menus/categories', async () => {
    await delay(300)
    return HttpResponse.json({ categories: groupByCuisine(fakeMenus) })
  }),

  http.get('*/api/menus/pick', async ({ request }) => {
    await delay(300)
    const params = new URL(request.url).searchParams
    const excludedCuisines = params.getAll('excludeCuisine')
    const excludedMenus = params.getAll('excludeMenu')
    const allowed = fakeMenus.filter(
      ({ cuisine, menu }) =>
        !excludedCuisines.includes(cuisine) && !excludedMenus.includes(menu),
    )
    if (allowed.length === 0) {
      return new HttpResponse(null, { status: 422 })
    }
    // 직전 메뉴는 그것밖에 남지 않았으면 다시 골라도 되게 서버처럼 느슨하게 뺀다.
    const exclude = params.get('exclude')
    const fresh = allowed.filter(({ menu }) => menu !== exclude)
    const candidates = fresh.length > 0 ? fresh : allowed
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    return HttpResponse.json(
      placeAround(picked, Number(params.get('lat')), Number(params.get('lng'))),
    )
  }),
]
