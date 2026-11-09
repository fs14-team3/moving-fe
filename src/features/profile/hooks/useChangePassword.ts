import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { handleUnauthorized } from '@/features/auth/lib/session'
import { changePassword } from '@/features/profile/api'
import { isApiError, isUnauthorized } from '@/lib/api-error'

export function useChangePassword(
  onFieldErrors: (errors: { currentPassword: string }) => void,
) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: changePassword,
    meta: { ignoreUnauthorized: true },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.profile.passwordChangeSuccess)
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'INVALID_CREDENTIALS') {
        onFieldErrors({ currentPassword: '현재 비밀번호가 올바르지 않습니다.' })
      } else if (isUnauthorized(error)) {
        handleUnauthorized(queryClient, router)
      } else {
        toast.error(TOAST_MESSAGES.profile.passwordChangeFailed)
      }
    },
  })
}
