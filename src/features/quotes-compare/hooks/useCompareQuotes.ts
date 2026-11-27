import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { compareQuotes } from '../api'
import type { QuoteComparisonRequest } from '../types'

export function useCompareQuotes(requestId: string) {
  const queryClient = useQueryClient()

  const { mutate, data, isPending } = useMutation({
    mutationFn: (body: QuoteComparisonRequest) =>
      compareQuotes(requestId, body),
    onError: (error) => {
      if (isUnauthorized(error)) return

      if (isApiError(error) && error.status === 404) {
        toast.error(TOAST_MESSAGES.estimate.compareStale)
        void queryClient.invalidateQueries({
          queryKey: queryKeys.moveRequests.all,
        })
        return
      }

      toast.error(TOAST_MESSAGES.estimate.compareFailed)
    },
  })

  return { mutate, data, isPending }
}
