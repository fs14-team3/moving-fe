import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { logout } from '@/features/auth/api'

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.replace('/')
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.auth.logoutFailed)
    },
  })
}
