import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getQuoteDetail } from '../api'

export function useQuoteDetail(quoteId: string) {
  const { data, error, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.quotes.detail(quoteId),
    queryFn: () => getQuoteDetail(quoteId),
  })

  return {
    quote: data,
    error,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
