import { hashKey, type QueryClient } from '@tanstack/react-query'
import type { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { getCurrentPath, getLoginPath } from '@/features/auth/lib/paths'
import { queryKeys } from '@/lib/queryKeys'
import type { Me } from '@/features/auth/types'

export async function resetSession(queryClient: QueryClient, me: Me | null) {
  await queryClient.cancelQueries({
    queryKey: queryKeys.user.me(),
    exact: true,
  })
  queryClient.removeQueries({
    predicate: (query) => query.queryHash !== hashKey(queryKeys.user.me()),
  })
  queryClient.setQueryData<Me | null>(queryKeys.user.me(), me)
}

export async function handleUnauthorized(
  queryClient: QueryClient,
  router: ReturnType<typeof useRouter>,
) {
  const me = queryClient.getQueryData<Me | null>(queryKeys.user.me())
  if (!me) {
    queryClient.setQueryData<Me | null>(queryKeys.user.me(), null)
    return
  }

  await resetSession(queryClient, null)
  toast.info(TOAST_MESSAGES.auth.sessionExpired)
  router.replace(getLoginPath(me.role, getCurrentPath()))
}
