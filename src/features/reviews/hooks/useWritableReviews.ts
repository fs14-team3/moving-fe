import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getWritableReviews,
  type WritableReviewQuery,
} from '@/features/reviews/api'
import { queryKeys } from '@/lib/queryKeys'

export function useWritableReviews(query: WritableReviewQuery = {}) {
  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: queryKeys.reviews.writable(query),
    queryFn: () => getWritableReviews(query),
    // 페이지를 넘기는 동안 이전 페이지를 그대로 보여준다.
    placeholderData: keepPreviousData,
  })

  return {
    writableReviews: data?.items ?? [],
    totalPages: data?.totalPages ?? 0,
    hasData: data !== undefined,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  }
}
