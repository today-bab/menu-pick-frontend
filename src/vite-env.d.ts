/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 주소. 비우면 현재 페이지와 같은 주소를 씀 (개발 중에는 Vite 프록시). */
  readonly VITE_API_BASE_URL?: string
  /** `true`이면 MSW 가짜 응답을 씀. */
  readonly VITE_API_MOCKING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
