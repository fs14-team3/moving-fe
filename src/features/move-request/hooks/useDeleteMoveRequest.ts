import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteMoveRequest } from '../api'
import type { ActiveMoveRequestResponse, RequestId } from '../types'

// 요청이 이미 없거나(404) 그사이 견적이 도착한(409) 경우. 화면의 요청 정보가 오래된 것이다.
const STALE_STATUSES = [404, 409]

export function useDeleteMoveRequest() {
  const queryClient = useQueryClient()
  // 진행 중인 요청 · 받은 견적 · 받았던 견적이 모두 moveRequests 아래에 있다.
  const refreshMoveRequests = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.moveRequests.all })

  return useMutation({
    mutationFn: (requestId: RequestId) => deleteMoveRequest(requestId),
    onSuccess: (_data, requestId) => {
      toast.success(TOAST_MESSAGES.estimate.deleteSuccess)
      // 지운 요청의 견적을 다시 불러오지 않도록 진행 중인 요청을 먼저 비운다.
      queryClient.setQueryData<ActiveMoveRequestResponse>(
        queryKeys.moveRequests.active(),
        { moveRequest: null },
      )
      queryClient.removeQueries({
        queryKey: queryKeys.moveRequests.detail(requestId),
      })
      void refreshMoveRequests()
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(
        isApiError(error) && error.code === 'REQUEST_HAS_QUOTES'
          ? TOAST_MESSAGES.estimate.requestHasQuotes
          : TOAST_MESSAGES.estimate.deleteFailed,
      )
      if (
        isApiError(error) &&
        error.status !== null &&
        STALE_STATUSES.includes(error.status)
      )
        void refreshMoveRequests()
    },
  })
}
