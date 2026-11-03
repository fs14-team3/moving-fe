import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { rejectRequest } from '@/features/received-requests/api'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

export function useRejectRequest() {
  const queryClient = useQueryClient()
  const refreshRequests = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.receivedRequests.lists(),
    })

  return useMutation({
    mutationFn: (requestId: string) => rejectRequest(requestId),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.estimate.rejectSuccess)
      // 반려한 요청은 받은 요청 목록에서 사라지므로 목록을 다시 불러온다.
      void refreshRequests()
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(TOAST_MESSAGES.estimate.rejectFailed)
      // 이미 없어진 요청이면 목록이 오래된 것이라 다시 불러온다.
      if (isApiError(error) && error.status === 404) void refreshRequests()
    },
  })
}
