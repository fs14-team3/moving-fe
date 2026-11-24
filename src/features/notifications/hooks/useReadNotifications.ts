import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readNotification } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

// 패널에 보여 준 알림만 읽음 처리한다.
export function useReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      Promise.allSettled(notificationIds.map((id) => readNotification(id))),
    onSuccess: (results) => {
      const readCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value.updated,
      ).length
      // 다시 불러오기 전에 읽은 만큼 바로 빼서 빨간 점을 지운다.
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (count) =>
          count === undefined ? count : Math.max(0, count - readCount),
      )
    },
    onSettled: () => {
      // 남은 알림 수는 서버 기준으로 다시 맞춘다.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      })
      queryClient.removeQueries({ queryKey: queryKeys.notifications.list() })
    },
  })
}
