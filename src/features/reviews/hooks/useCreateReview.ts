import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { createReview, type ReviewCreate } from '@/features/reviews/api'
import type { components } from '@/lib/api-schema'
import { isApiError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

type ErrorCode = components['schemas']['ErrorCode']

// 이미 작성했거나 작성할 수 없는 견적이라 목록이 오래된 것이다. (리뷰 모달을 닫을 때 쓴다)
export function isStaleReviewTarget(error: unknown) {
  return (
    isApiError(error) &&
    (error.status === 404 || (error.code as ErrorCode) === 'REVIEW_NOT_ALLOWED')
  )
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  // 작성 가능한 리뷰 · 내가 작성한 리뷰가 모두 reviews 아래에 있다.
  const refreshReviews = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })

  return useMutation({
    mutationFn: (body: ReviewCreate) => createReview(body),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.review.createSuccess)
      void refreshReviews()
      // 기사님 평점 · 리뷰 수 · 리뷰 목록도 바뀐다.
      void queryClient.invalidateQueries({ queryKey: queryKeys.movers.all })
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      if (isStaleReviewTarget(error)) {
        toast.error(TOAST_MESSAGES.review.notAllowed)
        void refreshReviews()
        return
      }
      toast.error(TOAST_MESSAGES.review.createFailed)
    },
  })
}
