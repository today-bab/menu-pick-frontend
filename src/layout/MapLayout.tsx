import type { ReactNode, Ref } from 'react'

type MapLayoutProps = {
  /** 화면 전체에 깔리는 지도. */
  map: ReactNode
  /** 지도 오른쪽 위에 떠 있는 버튼들. */
  actions: ReactNode
  /** 좁은 화면에서는 아래 시트, 넓은 화면(1024px~)에서는 왼쪽 패널에 들어갈 내용. */
  sheet: ReactNode
  /** 지도가 가려진 만큼을 재기 위해 시트 요소를 넘겨받는다. */
  sheetRef?: Ref<HTMLElement>
}

const TITLE = '오늘 뭐 먹지'

/**
 * 지도를 화면 전체에 깔고, 그 위에 서비스 이름·버튼과 시트를 겹쳐 놓는다.
 * 페이지 자체는 스크롤하지 않아 지도가 늘 보인다.
 */
export function MapLayout({ map, actions, sheet, sheetRef }: MapLayoutProps) {
  return (
    <main className="relative h-svh w-full overflow-hidden">
      <div className="absolute inset-0">{map}</div>

      {/* 빈 곳은 지도를 그대로 만질 수 있게 하고, 버튼만 누를 수 있게 한다. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4 lg:left-[400px] lg:p-6">
        <h1 className="pointer-events-auto rounded-[14px] bg-white px-3 py-2 text-[15px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.1)] lg:hidden">
          {TITLE}
        </h1>
        <div className="pointer-events-auto ml-auto flex gap-2">{actions}</div>
      </div>

      <section
        ref={sheetRef}
        aria-label="오늘의 메뉴"
        className="absolute inset-x-0 bottom-0 z-20 flex max-h-[50svh] flex-col rounded-t-[20px] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:inset-y-0 lg:right-auto lg:w-[400px] lg:max-h-none lg:rounded-none lg:shadow-[4px_0_16px_rgba(0,0,0,0.08)]"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-gray-200 lg:hidden"
        />
        <p
          aria-hidden="true"
          className="hidden px-6 pt-6 text-lg font-bold lg:block"
        >
          {TITLE}
        </p>
        {sheet}
      </section>
    </main>
  )
}
