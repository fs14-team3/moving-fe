import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import type { MoverId } from '@/features/movers/types'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createDesignation } from '../api'
import type { RequestId } from '../types'

export function useCreateDesignation() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      requestId,
      moverId,
    }: {
      requestId: RequestId
      moverId: MoverId
    }) => createDesignation(requestId, moverId),
    onSuccess: async (_, { moverId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.moveRequests.active(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.movers.detail(moverId),
        }),
      ])

      toast.success(TOAST_MESSAGES.estimate.designationRequestSuccess)
    },
    onError: (error) => {
      if (isUnauthorized(error)) return

      if (isApiError(error) && error.code === 'REQUEST_NOT_PENDING') {
        toast.error(TOAST_MESSAGES.estimate.requestNotPending)
        return
      }

      if (isApiError(error) && error.code === 'ALREADY_DESIGNATED') {
        toast.error(TOAST_MESSAGES.estimate.alreadyDesignated)
        return
      }

      if (isApiError(error) && error.code === 'MOVER_ALREADY_RESPONDED') {
        toast.error(TOAST_MESSAGES.estimate.moverAlreadyResponded)
        return
      }

      if (isApiError(error) && error.code === 'DESIGNATION_LIMIT_REACHED') {
        toast.error(TOAST_MESSAGES.estimate.designationLimitReached)
        return
      }

      toast.error(TOAST_MESSAGES.estimate.designationRequestFailed)
    },
  })

  return {
    mutate,
    isPending,
  }
}
