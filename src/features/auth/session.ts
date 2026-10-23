import type { QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

export function clearSession(queryClient: QueryClient) {
  queryClient.clear()
  queryClient.setQueryData<Me | null>(meQueryKey, null)
}
