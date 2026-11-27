import { describe, expect, it } from 'vitest'
import {
  formatDday,
  fromDateKey,
  getDaysUntil,
  getUpcoming,
  groupByMoveDate,
  toDateKey,
} from '@/features/schedule/lib/schedule'
import type { SentQuote } from '@/features/sent-quotes/api'

function createQuote(id: string, moveDate: string): SentQuote {
  return {
    id,
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName: '김코드',
      moveType: 'SMALL',
      moveDate,
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

describe('groupByMoveDate', () => {
  it('이사일이 같은 견적을 한 날짜로 묶고 받은 순서를 지킨다', () => {
    const groups = groupByMoveDate([
      createQuote('a', '2026-12-01'),
      createQuote('b', '2026-12-05'),
      createQuote('c', '2026-12-01'),
    ])

    expect([...groups.keys()]).toEqual(['2026-12-01', '2026-12-05'])
    expect(groups.get('2026-12-01')?.map(({ id }) => id)).toEqual(['a', 'c'])
    expect(groups.get('2026-12-05')?.map(({ id }) => id)).toEqual(['b'])
  })

  it('견적이 없으면 빈 Map을 돌려준다', () => {
    expect(groupByMoveDate([]).size).toBe(0)
  })
})

describe('getUpcoming', () => {
  const quotes = [
    createQuote('late', '2026-12-20'),
    createQuote('past', '2026-11-20'),
    createQuote('today', '2026-11-26'),
    createQuote('soon', '2026-11-30'),
  ]

  it('오늘 이후 일정만 이사일이 가까운 순으로 돌려준다', () => {
    const upcoming = getUpcoming(quotes, '2026-11-26')

    expect(upcoming.map(({ id }) => id)).toEqual(['today', 'soon', 'late'])
  })

  it('이사일이 오늘이면 포함하고 어제면 뺀다', () => {
    expect(
      getUpcoming([createQuote('a', '2026-11-26')], '2026-11-26'),
    ).toHaveLength(1)
    expect(
      getUpcoming([createQuote('a', '2026-11-25')], '2026-11-26'),
    ).toHaveLength(0)
  })

  it('받은 배열을 바꾸지 않는다', () => {
    const input = [
      createQuote('b', '2026-12-05'),
      createQuote('a', '2026-12-01'),
    ]

    getUpcoming(input, '2026-11-26')

    expect(input.map(({ id }) => id)).toEqual(['b', 'a'])
  })
})

describe('getDaysUntil', () => {
  it('남은 날짜를 센다', () => {
    expect(getDaysUntil('2026-11-26', '2026-11-26')).toBe(0)
    expect(getDaysUntil('2026-11-29', '2026-11-26')).toBe(3)
  })

  it('지난 날짜는 음수다', () => {
    expect(getDaysUntil('2026-11-24', '2026-11-26')).toBe(-2)
  })

  it('달과 해가 바뀌어도 정확하다', () => {
    expect(getDaysUntil('2027-01-01', '2026-12-31')).toBe(1)
    expect(getDaysUntil('2026-03-01', '2026-02-28')).toBe(1)
  })
})

describe('formatDday', () => {
  it('오늘 · 앞으로 · 지난 날짜를 구분해 보여준다', () => {
    expect(formatDday(0)).toBe('D-DAY')
    expect(formatDday(3)).toBe('D-3')
    expect(formatDday(-2)).toBe('D+2')
  })
})

describe('toDateKey / fromDateKey', () => {
  it('Date를 시간대와 상관없이 같은 연 · 월 · 일의 문자열로 바꾼다', () => {
    expect(toDateKey(new Date(2026, 10, 5))).toBe('2026-11-05')
    expect(toDateKey(new Date(2026, 0, 31, 23, 59))).toBe('2026-01-31')
  })

  it('문자열을 그 날짜의 Date로 바꾼다', () => {
    const date = fromDateKey('2026-11-05')

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 10, 5,
    ])
  })

  it('서로 되돌려도 같은 값이다', () => {
    expect(toDateKey(fromDateKey('2026-12-31'))).toBe('2026-12-31')
  })
})
