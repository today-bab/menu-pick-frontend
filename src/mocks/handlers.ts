import { delay, http, HttpResponse } from 'msw'
import type { PickResult, Restaurant } from '../api/types'

function restaurant(name: string, distanceMeters: number): Restaurant {
  return {
    name,
    distanceMeters,
    placeUrl: `https://map.kakao.com/?q=${encodeURIComponent(name)}`,
  }
}

export const fakeMenus: PickResult[] = [
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

export const handlers = [
  http.get('*/api/menus/pick', async ({ request }) => {
    await delay(300)
    const exclude = new URL(request.url).searchParams.get('exclude')
    const candidates = fakeMenus.filter(({ menu }) => menu !== exclude)
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    return HttpResponse.json(picked)
  }),
]
