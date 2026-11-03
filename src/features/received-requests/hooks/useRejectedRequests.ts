import { useInfiniteQuery } from '@tanstack/react-query'
import { getRejectedRequests } from '@/features/received-requests/api'
import { queryKeys } from '@/lib/queryKeys'

export function useRejectedRequests() {
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
    queryKey: queryKeys.receivedRequests.rejected(),
    queryFn: ({ pageParam }) => getRejectedRequests({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const rejectedRequests = data?.pages.flatMap((page) => page.items) ?? []

  return {
    rejectedRequests,
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
