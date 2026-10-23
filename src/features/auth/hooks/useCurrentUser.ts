import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/auth/api'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

export function useCurrentUser() {
  const { data, isPending, isError } = useQuery<Me | null>({
    queryKey: meQueryKey,
    queryFn: getMe,
  })

  return { user: data ?? null, isPending, isError }
}
