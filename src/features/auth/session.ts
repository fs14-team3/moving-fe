import type { QueryClient } from '@tanstack/react-query'
import type { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'

export function clearSession(queryClient: QueryClient) {
  queryClient.clear()
  queryClient.setQueryData<Me | null>(meQueryKey, null)
}

export function handleUnauthorized(
  queryClient: QueryClient,
  router: ReturnType<typeof useRouter>,
) {
  if (!queryClient.getQueryData<Me | null>(meQueryKey)) {
    queryClient.setQueryData<Me | null>(meQueryKey, null)
    return
  }

  clearSession(queryClient)
  toast.info(TOAST_MESSAGES.auth.sessionExpired)
  router.replace('/login')
}
