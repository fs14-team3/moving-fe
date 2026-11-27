import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ScheduleDayList from '@/components/mover/schedule/ScheduleDayList'
import type { SentQuote } from '@/features/sent-quotes/api'

const TODAY = '2026-11-26'

function createQuote(id: string, customerName: string): SentQuote {
  return {
    id,
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName,
      moveType: 'SMALL',
      moveDate: '2026-11-30',
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

describe('ScheduleDayList', () => {
  it('선택한 날짜를 제목으로 보여준다', () => {
    render(<ScheduleDayList dateKey="2026-11-30" quotes={[]} today={TODAY} />)

    expect(
      screen.getByRole('heading', { name: /2026년 11월 30일 \(월\)/ }),
    ).toBeInTheDocument()
  })

  it('그날의 일정을 카드로 모두 보여주고 건수를 알려준다', () => {
    render(
      <ScheduleDayList
        dateKey="2026-11-30"
        quotes={[createQuote('1', '김코드'), createQuote('2', '박이사')]}
        today={TODAY}
      />,
    )

    expect(screen.getByRole('heading', { name: /2건/ })).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('김코드 고객님')).toBeInTheDocument()
    expect(within(items[1]).getByText('박이사 고객님')).toBeInTheDocument()
  })

  it('각 카드는 그 견적의 상세로 이동한다', () => {
    render(
      <ScheduleDayList
        dateKey="2026-11-30"
        quotes={[createQuote('1', '김코드'), createQuote('2', '박이사')]}
        today={TODAY}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/mover/quotes/1')
    expect(links[1]).toHaveAttribute('href', '/mover/quotes/2')
  })

  it('일정이 없는 날은 안내를 보여주고 목록과 건수는 숨긴다', () => {
    render(<ScheduleDayList dateKey="2026-11-29" quotes={[]} today={TODAY} />)

    expect(
      screen.getByText('이 날은 확정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText(/\d건/)).not.toBeInTheDocument()
  })

  it('제목으로 영역 이름을 붙인다', () => {
    render(<ScheduleDayList dateKey="2026-11-30" quotes={[]} today={TODAY} />)

    expect(
      screen.getByRole('region', { name: /2026년 11월 30일/ }),
    ).toBeInTheDocument()
  })
})
