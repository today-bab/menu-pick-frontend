import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CountButton } from './CountButton'

describe('CountButton', () => {
  it('이름 옆에 개수를 보여준다', () => {
    render(<CountButton label="제외" count={3} onClick={() => {}} />)

    expect(screen.getByRole('button', { name: '제외 3' })).toBeInTheDocument()
  })

  it('개수가 0이면 숫자를 숨긴다', () => {
    render(<CountButton label="기록" count={0} onClick={() => {}} />)

    expect(screen.getByRole('button', { name: '기록' })).toBeInTheDocument()
  })

  it('누르면 알린다', async () => {
    const onClick = vi.fn()
    render(<CountButton label="기록" count={2} onClick={onClick} />)

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '기록 2' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
