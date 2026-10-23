import { delay, http, HttpResponse } from 'msw'
import type { PickResult, Restaurant } from '../api/types'

type FakeRestaurant = {
  name: string
  distanceMeters: number
}

type FakeMenu = {
  menu: string
  restaurants: FakeRestaurant[]
}

const METERS_PER_DEGREE = 111_320

function restaurant(name: string, distanceMeters: number): FakeRestaurant {
  return { name, distanceMeters }
}

export const fakeMenus: FakeMenu[] = [
  {
    menu: '냉면',
    restaurants: [restaurant('평양면옥', 210), restaurant('함흥냉면', 540)],
  },
  {
    menu: '돈까스',
    restaurants: [restaurant('카츠정', 130), restaurant('오늘돈까스', 760)],
  },
  {
    menu: '국밥',
    restaurants: [
      restaurant('할매순대국', 90),
      restaurant('돼지국밥집', 320),
      restaurant('소머리국밥', 880),
    ],
  },
  {
    menu: '짜장면',
    restaurants: [restaurant('홍콩반점', 260), restaurant('만리장성', 610)],
  },
  { menu: '초밥', restaurants: [restaurant('스시하루', 450)] },
  {
    menu: '햄버거',
    restaurants: [restaurant('버거하우스', 180), restaurant('수제버거랩', 930)],
  },
  { menu: '쌀국수', restaurants: [restaurant('포베트남', 370)] },
  {
    menu: '떡볶이',
    restaurants: [restaurant('엽기분식', 150), restaurant('신당동떡볶이', 690)],
  },
  { menu: '파스타', restaurants: [restaurant('트라토리아', 520)] },
]

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
  http.get('*/api/menus/pick', async ({ request }) => {
    await delay(300)
    const params = new URL(request.url).searchParams
    const exclude = params.get('exclude')
    const candidates = fakeMenus.filter(({ menu }) => menu !== exclude)
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    return HttpResponse.json(
      placeAround(picked, Number(params.get('lat')), Number(params.get('lng'))),
    )
  }),
]
