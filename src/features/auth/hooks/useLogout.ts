import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { logout } from '@/features/auth/api'
import { clearSession } from '@/features/auth/lib/session'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await clearSession(queryClient)
      router.replace('/')
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.auth.logoutFailed)
    },
  })
}
