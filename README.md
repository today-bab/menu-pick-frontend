# menu-pick-frontend

근처 음식점을 기준으로 오늘의 메뉴를 랜덤으로 뽑아 주는 사이트의 프론트엔드.

## 실행

```sh
pnpm install
pnpm dev
```

개발 서버는 `/api` 요청을 로컬 백엔드(`http://localhost:8080`)로 넘긴다.
백엔드는 [menu-pick-backend](../menu-pick-backend)를 먼저 실행한다.

`.env.local`(git 제외)에 카카오 지도 JavaScript 키를 넣는다. 항목은 `.env.example` 참고.

## 스크립트

| 명령                | 설명               |
| ------------------- | ------------------ |
| `pnpm dev`          | 개발 서버          |
| `pnpm build`        | 타입 검사 후 빌드  |
| `pnpm lint`         | oxlint             |
| `pnpm format`       | Prettier로 포맷    |
| `pnpm format:check` | 포맷 검사만        |
| `pnpm preview`      | 빌드 결과 미리보기 |
| `pnpm test`         | 테스트 실행        |
| `pnpm test:watch`   | 테스트 감시 모드   |

## 가짜 API

백엔드 없이 개발할 수 있도록 [MSW](https://mswjs.io)로 `/api/menus/pick` 가짜 응답을 제공한다.
테스트에서는 항상 쓰고, 개발 서버에서는 `.env.development.local`에 `VITE_API_MOCKING=true`를 넣으면 켜진다.
가짜 데이터는 `src/mocks/handlers.ts`에 있다.
