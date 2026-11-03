import { describe, expect, it } from 'vitest'
import { formatTimeAgo } from '@/lib/formatTimeAgo'

const NOW = new Date('2026-11-03T12:00:00.000Z').getTime()

describe('formatTimeAgo', () => {
  it.each([
    ['2026-11-03T11:59:30.000Z', '방금 전'],
    ['2026-11-03T11:55:00.000Z', '5분 전'],
    ['2026-11-03T10:00:00.000Z', '2시간 전'],
    ['2026-11-01T12:00:00.000Z', '2일 전'],
    // 서버 시간이 조금 빨라도 음수가 되지 않는다.
    ['2026-11-03T12:00:10.000Z', '방금 전'],
  ])('%s는 %s로 보여준다', (dateTime, expected) => {
    expect(formatTimeAgo(dateTime, NOW)).toBe(expected)
  })
})
