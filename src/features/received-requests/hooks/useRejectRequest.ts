import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { rejectRequest } from '@/features/received-requests/api'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

type RejectRequestVariables = {
  requestId: string
  reason: string
}

// 다시 반려해도 같은 오류가 나는 요청인지 확인한다. (반려 모달을 닫을 때 쓴다)
// 요청이 없어졌으면 404, 대기 중이 아니거나 이미 견적을 보낸 요청이면 400이 온다.
export function isStaleRejectError(error: unknown) {
  return isApiError(error) && (error.status === 404 || error.status === 400)
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  const refreshRequests = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.receivedRequests.lists(),
    })

  return useMutation({
    mutationFn: ({ requestId, reason }: RejectRequestVariables) =>
      rejectRequest(requestId, reason),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.estimate.rejectSuccess)
      // 반려한 요청은 받은 요청 목록에서 사라지므로 목록을 다시 불러온다.
      void refreshRequests()
      // 내 견적 관리의 반려 요청 목록에는 새로 생기므로 함께 다시 불러온다.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.receivedRequests.rejected(),
      })
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(TOAST_MESSAGES.estimate.rejectFailed)
      // 이미 반려할 수 없는 요청이면 목록이 오래된 것이라 다시 불러온다.
      if (isStaleRejectError(error)) void refreshRequests()
    },
  })
}
