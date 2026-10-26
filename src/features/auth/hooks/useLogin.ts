import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { login } from '@/features/auth/api'
import { resetSession } from '@/features/auth/lib/session'
import { isUnauthorized } from '@/lib/api-error'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    meta: { ignoreUnauthorized: true },
    onSuccess: (user) => resetSession(queryClient, user),
    onError: (error) => {
      if (isUnauthorized(error)) {
        toast.error(TOAST_MESSAGES.auth.invalidCredentials)
      } else {
        toast.error(TOAST_MESSAGES.auth.loginFailed)
      }
    },
  })
}
