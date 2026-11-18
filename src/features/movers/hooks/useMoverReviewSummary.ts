import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getMoverReviewSummary } from '../api'
import { MoverId } from '../types'

export function useMoverReviewSummary(moverId: MoverId) {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.movers.reviewSummary(moverId),
    queryFn: () => getMoverReviewSummary(moverId),
  })

  return {
    reviewSummary: data,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
