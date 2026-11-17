import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  deleteProofPhoto,
  type ProofPhotoList,
} from '@/features/proof-photos/api'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const STALE_STATUSES = [404, 409]

export function useDeleteProofPhoto(quoteId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.proofPhotos.list(quoteId)

  return useMutation({
    mutationFn: (photoId: string) => deleteProofPhoto(quoteId, photoId),
    onSuccess: (_data, photoId) => {
      toast.success(TOAST_MESSAGES.proofPhoto.deleteSuccess)
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
      if (
        isApiError(error) &&
        error.status !== null &&
        STALE_STATUSES.includes(error.status)
      )
        void queryClient.invalidateQueries({ queryKey })
    },
  })
}
