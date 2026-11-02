import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PickResult } from '../api/types'
import { HistoryList } from './HistoryList'

function pick(menu: string, count: number): PickResult {
  return {
    menu,
    restaurants: Array.from({ length: count }, (_, index) => ({
      name: `${menu}${index}`,
      distanceMeters: 100,
      lat: 0,
      lng: 0,
      placeUrl: `https://example.com/${menu}/${index}`,
    })),
  }
}

const entries = [pick('냉면', 2), pick('돈까스', 1), pick('국밥', 3)]

describe('HistoryList', () => {
  it('최근에 뽑은 것부터 메뉴와 가게 수를 보여준다', () => {
    render(
      <HistoryList entries={entries} currentIndex={2} onSelect={() => {}} />,
    )

    const items = screen.getAllByRole('button')
    expect(items.map((item) => item.textContent)).toEqual([
      '국밥가게 3곳',
      '돈까스가게 1곳',
      '냉면가게 2곳',
    ])
  })

  it('지금 보고 있는 결과를 표시한다', () => {
    render(
      <HistoryList entries={entries} currentIndex={1} onSelect={() => {}} />,
    )

    expect(screen.getByRole('button', { name: /돈까스/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: /국밥/ })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('누르면 그 기록의 순서를 알린다', async () => {
    const onSelect = vi.fn()
    render(
      <HistoryList entries={entries} currentIndex={2} onSelect={onSelect} />,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: /냉면/ }))

    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('새로고침하면 기록이 사라진다고 알려준다', () => {
    render(
      <HistoryList entries={entries} currentIndex={2} onSelect={() => {}} />,
    )

    expect(screen.getByText('새로고침하면 기록이 사라져요')).toBeInTheDocument()
  })
})
