import { useInfiniteQuery } from '@tanstack/react-query'
import { getQuoteHistory } from '@/features/my-quotes/api'
import { queryKeys } from '@/lib/queryKeys'

export function useQuoteHistory() {
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
    queryKey: queryKeys.moveRequests.history(),
    queryFn: ({ pageParam }) => getQuoteHistory({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const history = data?.pages.flatMap((page) => page.items) ?? []

  return {
    history,
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
