import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getActiveMoveRequest } from '../api'

export function useActiveMoveRequest() {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.moveRequests.active(),
    queryFn: getActiveMoveRequest,
  })

  return {
    activeMoveRequest: data?.moveRequest,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
