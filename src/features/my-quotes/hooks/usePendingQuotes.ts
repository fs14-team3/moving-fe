import { useQuery } from '@tanstack/react-query'
import { getRequestQuotes } from '@/features/my-quotes/api'
import { queryKeys } from '@/lib/queryKeys'

// 아직 확정하지 않은 진행 중인 요청의 받은 견적
export function usePendingQuotes(requestId: string) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.moveRequests.quotes(requestId),
    queryFn: () => getRequestQuotes(requestId),
  })

  return {
    pendingQuotes: data?.items ?? [],
    hasData: data !== undefined,
    isPending,
    isError,
    refetch,
  }
}
