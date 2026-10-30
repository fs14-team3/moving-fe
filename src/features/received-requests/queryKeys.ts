import type { ReceivedRequestQuery } from '@/features/received-requests/api'

export const receivedRequestKeys = {
  all: ['receivedRequests'] as const,
  list: (query: ReceivedRequestQuery) =>
    [...receivedRequestKeys.all, 'list', query] as const,
}
