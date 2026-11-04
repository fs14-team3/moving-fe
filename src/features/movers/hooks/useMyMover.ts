import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getMyMover } from '../api'

export function useMyMover() {
  const {
    data: mover,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: queryKeys.movers.me(),
    queryFn: getMyMover,
  })

  return {
    mover,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
