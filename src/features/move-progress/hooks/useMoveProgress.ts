import { useQuery } from '@tanstack/react-query'
import { getMoveProgress } from '@/features/move-progress/api'
import { queryKeys } from '@/lib/queryKeys'

const POLL_INTERVAL = 60 * 1000

export function useMoveProgress(quoteId: string, poll: boolean) {
  const { data, isPending, isLoadingError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.moveProgress.detail(quoteId),
    queryFn: () => getMoveProgress(quoteId),
    refetchInterval: ({ state }) =>
      poll && state.data?.nextStep !== null ? POLL_INTERVAL : false,
  })

  return { progress: data, isPending, isLoadingError, refetch, isRefetching }
}
