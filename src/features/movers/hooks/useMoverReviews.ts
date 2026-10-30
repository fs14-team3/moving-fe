import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getMoverReviews } from '../api'
import type { MoverId, MoverReviewListParams } from '../types'

export function useMoverReviews(
  moverId: MoverId,
  query: MoverReviewListParams = {},
) {
  const { data, error, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: queryKeys.movers.reviews(moverId, query),
    queryFn: () => getMoverReviews(moverId, query),
  })

  return {
    reviews: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 0,
    error,
    isPending,
    isError,
    isRefetching,
    refetch,
  }
}
