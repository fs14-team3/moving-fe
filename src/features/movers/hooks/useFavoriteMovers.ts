import { useInfiniteQuery } from '@tanstack/react-query'
import { getFavoriteMovers } from '../api'
import { favoriteMoverQueryKeys } from '../queryKeys'
import type { FavoriteMoverListFilters } from '../types'

type UseFavoriteMoversOptions = {
  enabled?: boolean
}

export function useFavoriteMovers(
  filters: FavoriteMoverListFilters = {},
  { enabled = true }: UseFavoriteMoversOptions = {},
) {
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
    queryKey: favoriteMoverQueryKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getFavoriteMovers({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled,
  })

  const favoriteMovers = data?.pages.flatMap((page) => page.items) ?? []

  return {
    favoriteMovers,
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
