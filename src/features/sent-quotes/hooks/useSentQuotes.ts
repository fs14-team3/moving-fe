import { useInfiniteQuery } from '@tanstack/react-query'
import { getSentQuotes } from '@/features/sent-quotes/api'
import { queryKeys } from '@/lib/queryKeys'

export function useSentQuotes() {
  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.sentQuotes.list(),
    queryFn: ({ pageParam }) => getSentQuotes({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const sentQuotes = data?.pages.flatMap((page) => page.items) ?? []

  return {
    sentQuotes,
    hasData: data !== undefined,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}
