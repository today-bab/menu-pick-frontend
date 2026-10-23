# menu-pick-frontend

근처 음식점을 기준으로 오늘의 메뉴를 랜덤으로 뽑아 주는 사이트의 프론트엔드.

## 실행

```sh
pnpm install
pnpm dev
```

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
`.env.development`의 `VITE_API_MOCKING=true`일 때 개발 서버에서 켜지고, 테스트에서는 항상 쓴다.
가짜 데이터는 `src/mocks/handlers.ts`에 있다.
