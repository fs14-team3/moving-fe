import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ScheduleCard from '@/components/mover/schedule/ScheduleCard'
import type { SentQuote } from '@/features/sent-quotes/api'

const TODAY = '2026-11-26'

function createQuote(
  overrides: Partial<SentQuote['moveRequest']> = {},
  quote: Partial<SentQuote> = {},
): SentQuote {
  return {
    id: 'quote-1',
    price: 1250000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: 'request-1',
      customerName: '김코드',
      moveType: 'HOME',
      moveDate: '2026-11-29',
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
      ...overrides,
    },
    ...quote,
  }
}

describe('ScheduleCard', () => {
  it('고객 이름 · 이사 유형 · 출발지와 도착지 · 견적 금액을 보여준다', () => {
    render(<ScheduleCard quote={createQuote()} today={TODAY} />)

    expect(screen.getByText('김코드 고객님')).toBeInTheDocument()
    expect(screen.getByText('가정이사')).toBeInTheDocument()
    expect(screen.getByText('서울특별시 중구')).toBeInTheDocument()
    expect(screen.getByText('경기도 수원시')).toBeInTheDocument()
    expect(screen.getByText('1,250,000원')).toBeInTheDocument()
  })

  it('고객 이름이 없으면 고객님으로 보여준다', () => {
    render(
      <ScheduleCard
        quote={createQuote({ customerName: null })}
        today={TODAY}
      />,
    )

    expect(screen.getByText('고객님')).toBeInTheDocument()
  })

  it('누르면 보낸 견적 상세로 이동하는 링크다', () => {
    render(
      <ScheduleCard quote={createQuote({}, { id: 'quote-7' })} today={TODAY} />,
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/mover/quotes/quote-7',
    )
  })

  it('앞으로 남은 이사는 D-day를 보여준다', () => {
    render(<ScheduleCard quote={createQuote()} today={TODAY} />)

    expect(screen.getByText('D-3')).toBeInTheDocument()
    expect(screen.queryByText('이사 완료')).not.toBeInTheDocument()
  })

  it('이사일이 오늘이면 D-DAY를 보여준다', () => {
    render(
      <ScheduleCard
        quote={createQuote({ moveDate: '2026-11-26' })}
        today={TODAY}
      />,
    )

    expect(screen.getByText('D-DAY')).toBeInTheDocument()
  })

  it('이사일이 지난 확정 견적은 이사 완료로 보여주고 D-day는 숨긴다', () => {
    render(
      <ScheduleCard
        quote={createQuote({ moveDate: '2026-11-20' })}
        today={TODAY}
      />,
    )

    expect(screen.getByText('이사 완료')).toBeInTheDocument()
    expect(screen.queryByText(/^D[-+]/)).not.toBeInTheDocument()
  })

  it('이미 완료로 처리된 요청은 이사일과 상관없이 이사 완료로 보여준다', () => {
    render(
      <ScheduleCard
        quote={createQuote({ moveDate: '2026-12-05', status: 'COMPLETED' })}
        today={TODAY}
      />,
    )

    expect(screen.getByText('이사 완료')).toBeInTheDocument()
  })
})
