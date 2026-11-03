import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readAllNotifications } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

export function useReadAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      // 다시 불러오지 않고 바로 0으로 바꿔서 빨간 점을 지운다.
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0)
      // 확인한 알림은 목록에서 빠지므로, 다음에 열 때 이전 목록이 잠깐 보이지 않게 지운다.
      queryClient.removeQueries({ queryKey: queryKeys.notifications.list() })
    },
    // 실패하면 빨간 점이 그대로 남고, 다음에 목록을 열 때 다시 읽음 처리한다.
  })
}
