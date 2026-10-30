import { useQuery } from '@tanstack/react-query'
import { getMover } from '../api'
import { moverQueryKeys } from '../queryKeys'
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
    queryKey: moverQueryKeys.detail(moverId),
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
