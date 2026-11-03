import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/auth/api'
import { queryKeys } from '@/lib/queryKeys'
import type { Me } from '@/features/auth/types'

export function useCurrentUser() {
  const { data, isPending, isError, isRefetching, refetch } =
    useQuery<Me | null>({
      queryKey: queryKeys.user.me(),
      queryFn: getMe,
    })

  return { user: data ?? null, isPending, isError, isRefetching, refetch }
}
