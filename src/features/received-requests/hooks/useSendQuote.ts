import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { sendQuote, type QuoteCreate } from '@/features/received-requests/api'
import type { components } from '@/lib/api-schema'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

type ErrorCode = components['schemas']['ErrorCode']

type SendQuoteVariables = QuoteCreate & {
  requestId: string
}

const ERROR_MESSAGE: Partial<Record<ErrorCode, string>> = {
  QUOTE_LIMIT_REACHED: TOAST_MESSAGES.estimate.quoteLimitReached,
  REQUEST_NOT_PENDING: TOAST_MESSAGES.estimate.requestNotPending,
  NOT_IN_SERVICE_AREA: TOAST_MESSAGES.estimate.notInServiceArea,
}

// 요청 상태가 이미 바뀌어 견적을 받을 수 없다는 뜻이라 목록도 다시 불러온다.
const STALE_REQUEST_CODES: ErrorCode[] = [
  'QUOTE_LIMIT_REACHED',
  'REQUEST_NOT_PENDING',
]

export function useSendQuote() {
  const queryClient = useQueryClient()
  const refreshRequests = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.receivedRequests.lists(),
    })

  return useMutation({
    mutationFn: ({ requestId, ...body }: SendQuoteVariables) =>
      sendQuote(requestId, body),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.estimate.sendSuccess)
      // 모달은 바로 닫고, 목록은 뒤에서 다시 불러온다.
      void refreshRequests()
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      const code = isApiError(error) ? (error.code as ErrorCode) : undefined
      toast.error(
        (code && ERROR_MESSAGE[code]) ?? TOAST_MESSAGES.estimate.sendFailed,
      )
      if (code && STALE_REQUEST_CODES.includes(code)) void refreshRequests()
    },
  })
}
