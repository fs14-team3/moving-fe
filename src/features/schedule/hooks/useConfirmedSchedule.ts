import { useQuery } from '@tanstack/react-query'
import { getConfirmedQuotes, PAGE_SIZE } from '@/features/schedule/api'
import { queryKeys } from '@/lib/queryKeys'

// 기사님의 확정된 이사 일정. 확정 견적 전체를 한 번에 받아 날짜별로 보여준다.
// 보낸 견적 목록(sentQuotes.lists) 아래 키를 써서, 견적을 보내면 함께 다시 불러온다.
export function useConfirmedSchedule() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.sentQuotes.list({
      status: 'CONFIRMED',
      limit: PAGE_SIZE,
    }),
    queryFn: getConfirmedQuotes,
  })

  return {
    confirmedQuotes: data ?? [],
    hasData: data !== undefined,
    isPending,
    isError,
    refetch,
  }
}
