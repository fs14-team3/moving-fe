import type { Role } from '@/features/auth/types'
import type { Notification } from '@/features/notifications/api'

// 알림을 눌렀을 때 이동할 페이지. 이동할 곳이 없으면 null
// 견적 알림은 그 견적 상세로 보내고, quoteId가 없으면 목록으로 보낸다.
export function getNotificationHref(
  { type, quoteId }: Notification,
  role: Role,
) {
  if (role === 'MOVER') {
    switch (type) {
      case 'NEW_REQUEST':
      case 'NEW_DESIGNATED_REQUEST':
        return '/mover/requests'
      case 'QUOTE_CONFIRMED':
        return quoteId ? `/mover/quotes/${quoteId}` : '/mover/quotes'
      default:
        return null
    }
  }

  switch (type) {
    case 'NEW_QUOTE':
    case 'QUOTE_CONFIRMED':
      return quoteId ? `/my-quotes/${quoteId}` : '/my-quotes'
    default:
      return null
  }
}
