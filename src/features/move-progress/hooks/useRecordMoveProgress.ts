import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MOVE_PROGRESS_STEPS } from '@/constants/moveProgress'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  recordMoveProgress,
  type MoveProgressStep,
} from '@/features/move-progress/api'
import { isApiError, isClientError, isUnauthorized } from '@/lib/api-error'
import { getOptionLabel } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'

const ERROR_MESSAGES: Record<string, string> = {
  MOVE_PROGRESS_NOT_ALLOWED: TOAST_MESSAGES.moveProgress.notAllowed,
  MOVE_PROGRESS_OUT_OF_ORDER: TOAST_MESSAGES.moveProgress.outOfOrder,
}

export function useRecordMoveProgress(quoteId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.moveProgress.detail(quoteId)

  return useMutation({
    mutationFn: (step: MoveProgressStep) => recordMoveProgress(quoteId, step),
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    onSuccess: async (progress, step) => {
      toast.success(
        TOAST_MESSAGES.moveProgress.recordSuccess(
          getOptionLabel(MOVE_PROGRESS_STEPS, step),
        ),
      )
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData(queryKey, progress)
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(
        (isApiError(error) && ERROR_MESSAGES[error.code]) ||
          TOAST_MESSAGES.moveProgress.recordFailed,
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
