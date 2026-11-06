import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { confirmQuote } from '@/features/my-quotes/api'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

// 견적이나 요청이 이미 없거나(404) 확정·만료된(409) 경우. 화면의 목록이 오래된 것이다.
const STALE_STATUSES = [404, 409]

export function useConfirmQuote() {
  const queryClient = useQueryClient()
  // 진행 중인 요청 · 받은 견적 · 받았던 견적이 모두 moveRequests 아래에 있다.
  const refreshMoveRequests = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.moveRequests.all })

  return useMutation({
    mutationFn: (quoteId: string) => confirmQuote(quoteId),
    onSuccess: (_data, quoteId) => {
      toast.success(TOAST_MESSAGES.estimate.confirmSuccess)
      // 확정한 요청의 견적은 대기 중인 견적에서 빠지고 받았던 견적으로 옮겨 간다.
      void refreshMoveRequests()
      void queryClient.invalidateQueries({
        queryKey: queryKeys.quotes.detail(quoteId),
      })
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(TOAST_MESSAGES.estimate.confirmFailed)
      if (
        isApiError(error) &&
        error.status !== null &&
        STALE_STATUSES.includes(error.status)
      )
        void refreshMoveRequests()
    },
  })
}
