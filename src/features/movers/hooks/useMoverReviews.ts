import { queryKeys } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMoverReviews } from '../api'
import type { MoverId, MoverReviewListParams } from '../types'

export function useMoverReviews(
  moverId: MoverId,
  query: MoverReviewListParams = {},
) {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useQuery({
      queryKey: queryKeys.movers.reviews(moverId, query),
      queryFn: () => getMoverReviews(moverId, query),
      placeholderData: keepPreviousData,
    })

  return {
    reviews: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 0,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
    refetch,
  }
}
