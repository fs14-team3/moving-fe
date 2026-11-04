import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readNotification } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

// 패널에 보여 준 알림만 읽음 처리한다.
// 전체 읽음(read-all)을 쓰면 아직 불러오지 않은 페이지나 열어 둔 사이 온 알림까지 읽음 처리되어
// 읽지 않은 알림만 주는 목록에서 다시 볼 수 없게 된다.
export function useReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      Promise.allSettled(notificationIds.map((id) => readNotification(id))),
    onSuccess: (results) => {
      const readCount = results.filter(
        (result) => result.status === 'fulfilled',
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
      // 읽은 알림은 목록에서 빠지므로, 다음에 열 때 이전 목록이 잠깐 보이지 않게 지운다.
      // 읽음 처리에 실패한 알림은 다음에 열 때 다시 불러와진다.
      queryClient.removeQueries({ queryKey: queryKeys.notifications.list() })
    },
  })
}
