import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getMover } from '../api'
import type { MoverId } from '../types'

export function useMover(moverId: MoverId) {
  const {
    data: mover,
    error,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: queryKeys.movers.detail(moverId),
    queryFn: () => getMover(moverId),
  })

  return {
    mover,
    error,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
