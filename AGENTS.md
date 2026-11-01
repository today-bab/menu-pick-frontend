# menu-pick-frontend

근처 음식점을 기준으로 오늘의 메뉴를 랜덤으로 뽑아 주는 사이트의 프론트엔드 (Vite, TypeScript, pnpm).

이 파일은 문서 지도다. 작업 전에 아래에서 필요한 문서를 찾아 읽는다.

## 문서 지도

| 문서                                                                   | 언제 읽나                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [README.md](README.md)                                                 | 실행 방법, 스크립트 목록, 가짜 API(MSW) 사용법                      |
| [docs/git-conventions.md](docs/git-conventions.md)                     | 이슈·브랜치·커밋·PR·머지 규칙. **코드를 바꾸기 전에 반드시 읽는다** |
| [.github/workflows/ci.yml](.github/workflows/ci.yml)                   | CI 단계(lint → format → test → build)                               |
| [.github/workflows/conventions.yml](.github/workflows/conventions.yml) | PR의 브랜치 이름·제목·`Closes #N` 검사                              |
| [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE)                      | 이슈를 만들 때 쓰는 기능·버그 템플릿                                |
| [.github/pull_request_template.md](.github/pull_request_template.md)   | PR 본문 템플릿                                                      |

## 관련 저장소

- [menu-pick-backend](../menu-pick-backend) — 호출하는 API 서버. API 명세는 그쪽 README에 있다
- [menu-pick-gitops](../menu-pick-gitops) — 배포 설정

## 자주 쓰는 명령

```sh
pnpm dev            # 개발 서버 (/api는 localhost:8080 백엔드로 전달)
pnpm lint && pnpm format:check && pnpm test && pnpm build   # CI와 같은 검사
```
