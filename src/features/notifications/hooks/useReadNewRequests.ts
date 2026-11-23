import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readNewRequests } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

export function useReadNewRequests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (latestAt: string) => readNewRequests(latestAt),
    onSuccess: ({ updated }) => {
      if (!updated) return
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (count) => (count === undefined ? count : Math.max(0, count - 1)),
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      })
      queryClient.removeQueries({
        queryKey: queryKeys.notifications.newRequests(),
      })
    },
  })
}
