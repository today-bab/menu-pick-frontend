import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MapPin } from './MapPin'

describe('MapPin', () => {
  it('선택되면 핀 위에 가게 이름을 띄운다', () => {
    render(<MapPin name="할매김치찌개" selected onClick={() => {}} />)

    expect(screen.getByText('할매김치찌개')).toBeInTheDocument()
  })

  it('선택되지 않으면 이름을 띄우지 않는다', () => {
    render(<MapPin name="할매김치찌개" selected={false} onClick={() => {}} />)

    expect(screen.queryByText('할매김치찌개')).not.toBeInTheDocument()
  })

  it('누르면 알린다', async () => {
    const onClick = vi.fn()
    render(<MapPin name="할매김치찌개" selected={false} onClick={onClick} />)

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '할매김치찌개' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
