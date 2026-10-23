import { hashKey, type QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

export async function clearSession(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: meQueryKey, exact: true })
  queryClient.removeQueries({
    predicate: (query) => query.queryHash !== hashKey(meQueryKey),
  })
  queryClient.setQueryData<Me | null>(meQueryKey, null)
}
