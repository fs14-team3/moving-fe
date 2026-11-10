import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyReviews } from '@/features/reviews/api'
import { queryKeys } from '@/lib/queryKeys'

const PAGE_SIZE = 10

// 명세는 페이지 번호 방식이라 마지막으로 받은 페이지 다음 번호를 불러온다.
export function useMyReviews() {
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
    queryKey: queryKeys.reviews.mine({ pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getMyReviews({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const myReviews = data?.pages.flatMap((page) => page.items) ?? []

  return {
    myReviews,
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
