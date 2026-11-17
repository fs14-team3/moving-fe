import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  deleteProofPhoto,
  type ProofPhotoList,
} from '@/features/proof-photos/api'
import { isApiError, isClientError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

export function useDeleteProofPhoto(quoteId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.proofPhotos.list(quoteId)

  return useMutation({
    mutationFn: (photoId: string) => deleteProofPhoto(quoteId, photoId),
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    onSuccess: async (_data, photoId) => {
      toast.success(TOAST_MESSAGES.proofPhoto.deleteSuccess)
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<ProofPhotoList>(
        queryKey,
        (list) =>
          list && {
            ...list,
            items: list.items.filter(({ id }) => id !== photoId),
          },
      )
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(
        isApiError(error) && error.code === 'PROOF_PHOTO_REVIEWED'
          ? TOAST_MESSAGES.proofPhoto.deleteReviewed
          : TOAST_MESSAGES.proofPhoto.deleteFailed,
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
