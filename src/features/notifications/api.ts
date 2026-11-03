import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Notification = Schemas['Notification']

export type NotificationType = Schemas['NotificationType']

type NotificationQuery = NonNullable<
  operations['listNotifications']['parameters']['query']
>

// TODO(#87): BE 알림 PR(#52)이 머지되면 api:types를 다시 생성하고 생성된 타입으로 바꾼다.
// 아래 두 응답과 unread-count · read-all 경로는 #52 명세를 보고 미리 맞춰 둔 것이다.
type UnreadCountResponse = { unreadCount: number }
type ReadAllResponse = { updatedCount: number }

// #52부터는 읽지 않은 알림만 최신순으로 내려준다.
export async function getNotifications(query: NotificationQuery = {}) {
  const { data } = await api.get<Schemas['NotificationListResponse']>(
    '/notifications',
    { params: query },
  )
  return data
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get<UnreadCountResponse>(
    '/notifications/unread-count',
  )
  return data.unreadCount
}

export async function readAllNotifications() {
  const { data } = await api.patch<ReadAllResponse>('/notifications/read-all')
  return data
}
