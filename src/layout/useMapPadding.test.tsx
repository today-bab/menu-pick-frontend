import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMapPadding } from './useMapPadding'

function Probe() {
  const { sheetRef, padding } = useMapPadding()
  return (
    <>
      <div ref={sheetRef} data-testid="sheet" />
      <output>{JSON.stringify(padding)}</output>
    </>
  )
}

function stubLayout({ wide }: { wide: boolean }) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: wide,
    addEventListener() {},
    removeEventListener() {},
  }))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 400,
    height: 380,
  } as DOMRect)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useMapPadding', () => {
  it('좁은 화면에서는 아래 시트 높이만큼 지도 아래쪽을 비운다', () => {
    stubLayout({ wide: false })
    render(<Probe />)

    expect(JSON.parse(screen.getByRole('status').textContent!)).toMatchObject({
      bottom: 380,
      left: 16,
    })
  })

  it('넓은 화면에서는 왼쪽 패널 폭만큼 지도 왼쪽을 비운다', () => {
    stubLayout({ wide: true })
    render(<Probe />)

    expect(JSON.parse(screen.getByRole('status').textContent!)).toMatchObject({
      left: 400,
      bottom: 16,
    })
  })
})
