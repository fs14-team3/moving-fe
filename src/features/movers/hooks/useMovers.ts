import { useInfiniteQuery } from '@tanstack/react-query'
import { getMovers } from '../api'
import { moverQueryKeys } from '../queryKeys'
import type { MoverListFilters } from '../types'

export function useMovers(filters: MoverListFilters = {}) {
  const {
    data,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: moverQueryKeys.list(filters),
    queryFn: ({ pageParam }) => getMovers({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const movers = data?.pages.flatMap((page) => page.items) ?? []

  return {
    movers,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}
