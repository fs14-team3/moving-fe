import { useQuery } from '@tanstack/react-query'
import { getMoverReviews } from '../api'
import { moverQueryKeys } from '../queryKeys'
import type { MoverId, MoverReviewListParams } from '../types'

export function useMoverReviews(
  moverId: MoverId,
  query: MoverReviewListParams = {},
) {
  const { data, error, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: moverQueryKeys.reviews(moverId, query),
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
