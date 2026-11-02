import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OverlaySheet } from './OverlaySheet'

function renderSheet(open = true) {
  const onClose = vi.fn()
  render(
    <>
      <button type="button">바깥 버튼</button>
      <OverlaySheet title="제외할 메뉴" open={open} onClose={onClose}>
        <button type="button">국밥</button>
        <button type="button">냉면</button>
      </OverlaySheet>
    </>,
  )
  return { user: userEvent.setup(), onClose }
}

describe('OverlaySheet', () => {
  it('닫혀 있으면 아무것도 보여주지 않는다', () => {
    renderSheet(false)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('제목이 붙은 대화상자로 내용을 보여준다', () => {
    renderSheet()

    const dialog = screen.getByRole('dialog', { name: '제외할 메뉴' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: '국밥' })).toBeVisible()
  })

  it('열리면 대화상자로 포커스를 옮긴다', () => {
    renderSheet()

    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('닫기 버튼, Esc, 어두운 배경으로 닫는다', async () => {
    const { user, onClose } = renderSheet()

    await user.click(screen.getByRole('button', { name: '닫기' }))
    await user.keyboard('{Escape}')
    await user.click(screen.getByTestId('sheet-scrim'))

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('Tab으로 움직여도 포커스가 대화상자 밖으로 나가지 않는다', async () => {
    const { user } = renderSheet()

    await user.tab()
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: '냉면' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: '냉면' })).toHaveFocus()
  })
})
