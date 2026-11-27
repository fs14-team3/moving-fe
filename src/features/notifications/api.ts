import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Notification = Schemas['Notification']

export type NotificationType = Schemas['NotificationType']

type NotificationQuery = NonNullable<
  operations['listNotifications']['parameters']['query']
>

type UnreadCountResponse =
  operations['getUnreadNotificationCount']['responses']['200']['content']['application/json']

type ReadResponse =
  operations['readNotification']['responses']['200']['content']['application/json']

type ReadAllResponse =
  operations['readAllNotifications']['responses']['200']['content']['application/json']

type ReadNewRequestsResponse =
  operations['readNewRequests']['responses']['200']['content']['application/json']

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

export async function readNotification(notificationId: string) {
  const { data } = await api.patch<ReadResponse>(
    `/notifications/${notificationId}/read`,
  )
  return data
}

export async function readAllNotifications() {
  const { data } = await api.patch<ReadAllResponse>('/notifications/read-all')
  return data
}

export async function getNewRequestSummary() {
  const { data } = await api.get<Schemas['NewRequestSummary']>(
    '/notifications/new-requests',
  )
  return data
}

export async function readNewRequests(latestAt: string) {
  const { data } = await api.patch<ReadNewRequestsResponse>(
    '/notifications/new-requests/read',
    { latestAt },
  )
  return data
}
