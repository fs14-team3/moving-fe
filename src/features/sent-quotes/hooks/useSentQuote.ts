import { useQuery } from '@tanstack/react-query'
import { getSentQuote } from '@/features/sent-quotes/api'
import { queryKeys } from '@/lib/queryKeys'

export function useSentQuote(quoteId: string) {
  const { data, error, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.sentQuotes.detail(quoteId),
    queryFn: () => getSentQuote(quoteId),
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
