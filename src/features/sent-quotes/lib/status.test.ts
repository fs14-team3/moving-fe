import { describe, expect, it } from 'vitest'
import type { SentQuote } from '@/features/sent-quotes/api'
import {
  isMoveCompleted,
  todayInSeoul,
} from '@/features/sent-quotes/lib/status'

function createMoveRequest(
  status: SentQuote['moveRequest']['status'],
  moveDate: string,
): SentQuote['moveRequest'] {
  return {
    id: 'request-1',
    customerName: '김코드',
    moveType: 'SMALL',
    moveDate,
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    status,
    isDesignated: false,
    createdAt: '2026-10-30T09:00:00.000Z',
  }
}

const TODAY = '2026-11-04'

describe('todayInSeoul', () => {
  it('한국 시간 기준 날짜를 돌려준다', () => {
    // UTC 15:00은 한국 시간으로 다음 날 00:00이다.
    expect(todayInSeoul(new Date('2026-11-03T15:00:00.000Z'))).toBe(
      '2026-11-04',
    )
    expect(todayInSeoul(new Date('2026-11-03T14:59:59.000Z'))).toBe(
      '2026-11-03',
    )
  })
})

describe('isMoveCompleted', () => {
  it.each<[SentQuote['moveRequest']['status'], string, boolean]>([
    ['COMPLETED', '2026-11-10', true],
    ['CONFIRMED', '2026-11-03', true],
    // 이사 당일은 아직 끝나지 않은 것으로 본다.
    ['CONFIRMED', '2026-11-04', false],
    ['CONFIRMED', '2026-11-05', false],
    ['PENDING', '2026-11-03', false],
    ['EXPIRED', '2026-11-03', false],
  ])('%s · 이사일 %s → %s', (status, moveDate, expected) => {
    expect(isMoveCompleted(createMoveRequest(status, moveDate), TODAY)).toBe(
      expected,
    )
  })
})
