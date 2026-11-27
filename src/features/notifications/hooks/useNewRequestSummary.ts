import { useQuery } from '@tanstack/react-query'
import { getNewRequestSummary } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

export function useNewRequestSummary({ enabled }: { enabled: boolean }) {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.notifications.newRequests(),
    queryFn: getNewRequestSummary,
    enabled,
    staleTime: 0,
  })

  return {
    summary: data?.latestAt
      ? { count: data.count, latestAt: data.latestAt }
      : null,
    isPending: enabled && isPending,
  }
}
