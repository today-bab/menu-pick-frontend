import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

type OverlaySheetProps = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * 메인 화면 위를 덮는 시트(대화상자). 모바일에서는 아래에서 올라오고,
 * 넓은 화면에서는 왼쪽 패널 자리를 덮는다.
 * ✕, 어두운 배경, Esc로 닫고, 열려 있는 동안 포커스는 시트 안에서만 돈다.
 */
export function OverlaySheet({
  title,
  open,
  onClose,
  children,
}: OverlaySheetProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // 열릴 때 시트로 포커스를 옮기고, 닫히면 열기 전에 있던 곳으로 돌려준다.
  useEffect(() => {
    if (!open) {
      return
    }
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      previous?.focus()
    }
  }, [open, onClose])

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    const panel = panelRef.current
    if (event.key !== 'Tab' || !panel) {
      return
    }
    const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (focusable.length === 0) {
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || active === panel)) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        data-testid="sheet-scrim"
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapFocus}
        className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-[20px] bg-white px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))] outline-none motion-safe:animate-sheet-up lg:inset-y-0 lg:right-auto lg:w-[400px] lg:max-h-none lg:rounded-none lg:p-6"
      >
        <div className="flex items-center justify-between pb-4">
          <h2 id={titleId} className="text-[17px] font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="-m-2 p-2 text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
