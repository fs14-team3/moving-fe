import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { readAllNotifications } from '@/features/notifications/api'
import { isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useReadAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0)
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(TOAST_MESSAGES.notification.readAllFailed)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}
