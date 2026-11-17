import { describe, expect, it } from 'vitest'
import type { Role } from '@/features/auth/types'
import type {
  Notification,
  NotificationType,
} from '@/features/notifications/api'
import { getNotificationHref } from '@/features/notifications/link'

function notification(
  type: NotificationType,
  quoteId: string | null = 'quote-1',
): Notification {
  return {
    id: 'notification-1',
    userId: 'user-1',
    type,
    payload: {},
    quoteId,
    readAt: null,
    createdAt: '2026-11-17T00:00:00.000Z',
  }
}

describe('getNotificationHref', () => {
  it.each<[Role, NotificationType, string | null]>([
    ['MOVER', 'NEW_REQUEST', '/mover/requests'],
    ['MOVER', 'NEW_DESIGNATED_REQUEST', '/mover/requests'],
    ['MOVER', 'QUOTE_CONFIRMED', '/mover/quotes/quote-1'],
    ['MOVER', 'MOVE_DAY', null],
    ['CUSTOMER', 'NEW_QUOTE', '/my-quotes/quote-1'],
    ['CUSTOMER', 'QUOTE_CONFIRMED', '/my-quotes/quote-1'],
    ['CUSTOMER', 'MOVE_DAY', null],
  ])('%s의 %s 알림은 %s로 이동한다', (role, type, href) => {
    expect(getNotificationHref(notification(type), role)).toBe(href)
  })

  it.each<[Role, NotificationType, string]>([
    ['MOVER', 'QUOTE_CONFIRMED', '/mover/quotes'],
    ['CUSTOMER', 'NEW_QUOTE', '/my-quotes'],
  ])(
    '견적 id가 없으면 %s의 %s 알림은 목록(%s)으로 이동한다',
    (role, type, href) => {
      expect(getNotificationHref(notification(type, null), role)).toBe(href)
    },
  )
})
