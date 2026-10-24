import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { login } from '@/features/auth/api'
import { getPathAfterLogin } from '@/features/auth/lib/paths'
import { resetSession } from '@/features/auth/lib/session'
import { isUnauthorized } from '@/lib/api'

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: login,
    meta: { ignoreUnauthorized: true },
    onSuccess: async (user) => {
      await resetSession(queryClient, user)
      router.replace(getPathAfterLogin(user))
    },
    onError: (error) => {
      if (isUnauthorized(error)) {
        toast.error(TOAST_MESSAGES.auth.invalidCredentials)
      } else {
        toast.error(TOAST_MESSAGES.auth.loginFailed)
      }
    },
  })
}
