import { useQuery } from '@tanstack/react-query'
import { getUnreadNotificationCount } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

// 새 알림이 오면 종 아이콘에 표시되도록 1분마다 다시 확인한다.
const REFETCH_INTERVAL = 60 * 1000

export function useUnreadNotificationCount() {
  const { data } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
    refetchInterval: REFETCH_INTERVAL,
  })

  return { hasUnread: (data ?? 0) > 0 }
}
