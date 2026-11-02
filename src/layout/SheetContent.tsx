import type { ReactNode } from 'react'

type SheetContentProps = {
  /** 시트 본문. 길어지면 이 안에서 스크롤한다. */
  children: ReactNode
  /** 시트 맨 아래에 늘 붙어 있는 영역(안내, 뽑기 버튼). */
  footer: ReactNode
}

/** 시트 안을 본문과 아래에 고정된 영역으로 나눈다. */
export function SheetContent({ children, footer }: SheetContentProps) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 lg:px-6 lg:pt-4">
        {children}
      </div>
      <div className="flex shrink-0 flex-col gap-3 px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] lg:px-6">
        {footer}
      </div>
    </>
  )
}
