import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMoveRequest } from '../api'

export function useCreateMoveRequest() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: createMoveRequest,
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.estimate.requestSuccess)

      queryClient.invalidateQueries({
        queryKey: queryKeys.moveRequests.active(),
      })
    },
    onError: (error) => {
      if (isUnauthorized(error)) return

      if (isApiError(error) && error.code === 'ACTIVE_REQUEST_EXISTS') {
        toast.error(TOAST_MESSAGES.estimate.activeRequestExists)
        return
      }

      toast.error(TOAST_MESSAGES.estimate.requestFailed)
    },
  })

  return { mutate, isPending }
}
