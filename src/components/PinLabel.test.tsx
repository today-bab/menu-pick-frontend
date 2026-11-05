import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PinLabel } from './PinLabel'

describe('PinLabel', () => {
  it('가게 이름을 보여준다', () => {
    render(<PinLabel name="할매김치찌개" />)

    expect(screen.getByText('할매김치찌개')).toBeInTheDocument()
  })
})
