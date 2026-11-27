import { describe, expect, it } from 'vitest'
import { getNotificationHref } from '@/features/notifications/link'

describe('getNotificationHref', () => {
  it.each([
    ['CUSTOMER', 'NEW_QUOTE', '/my-quotes/quote-1'],
    ['CUSTOMER', 'QUOTE_CONFIRMED', '/my-quotes/quote-1'],
    ['MOVER', 'NEW_DESIGNATED_REQUEST', '/mover/requests'],
    ['MOVER', 'QUOTE_CONFIRMED', '/mover/quotes/quote-1'],
  ] as const)('%s의 %s 알림은 %s로 연결한다', (role, type, href) => {
    expect(getNotificationHref({ type, quoteId: 'quote-1' }, role)).toBe(href)
  })

  it.each(['NEW_QUOTE', 'QUOTE_CONFIRMED'] as const)(
    '견적 id가 없는 %s 알림은 연결하지 않는다',
    (type) => {
      expect(
        getNotificationHref({ type, quoteId: null }, 'CUSTOMER'),
      ).toBeNull()
    },
  )

  it('이사 예정일 알림은 연결하지 않는다', () => {
    expect(
      getNotificationHref({ type: 'MOVE_DAY', quoteId: null }, 'CUSTOMER'),
    ).toBeNull()
  })
})
