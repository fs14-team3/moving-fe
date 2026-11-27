import type { Role } from '@/features/auth/types'
import type { Notification } from '@/features/notifications/api'

export function getNotificationHref(
  { type, quoteId }: Pick<Notification, 'type' | 'quoteId'>,
  role: Role,
) {
  switch (type) {
    case 'NEW_DESIGNATED_REQUEST':
      return '/mover/requests'
    case 'NEW_QUOTE':
      return quoteId ? `/my-quotes/${quoteId}` : null
    case 'QUOTE_CONFIRMED':
      if (!quoteId) return null
      return role === 'MOVER'
        ? `/mover/quotes/${quoteId}`
        : `/my-quotes/${quoteId}`
    case 'DAMAGE_REPORTED':
      return quoteId ? `/mover/quotes/${quoteId}` : null
    default:
      return null
  }
}
