import { useInfiniteQuery } from '@tanstack/react-query'
import { getNotifications } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'

// 알림 목록은 열었을 때만 불러온다. 열 때마다 새로 온 알림을 보여주도록 캐시를 바로 오래된 것으로 본다.
export function useNotifications({
  enabled = true,
}: { enabled?: boolean } = {}) {
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
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => getNotifications({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled,
    staleTime: 0,
  })

  const notifications = data?.pages.flatMap((page) => page.items) ?? []

  return {
    notifications,
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
