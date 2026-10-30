import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import type { Role } from '@/features/auth/types'
import { updateProfile } from '@/features/profile/api'
import { setMyProfile } from '@/features/profile/lib/cache'
import { getProfileFieldErrors } from '@/features/profile/lib/errors'
import type {
  ProfileFieldErrors,
  ProfileUpdate,
} from '@/features/profile/types'
import { isUnauthorized } from '@/lib/api-error'

export function useUpdateProfile(
  role: Role,
  onFieldErrors: (errors: ProfileFieldErrors) => void,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProfileUpdate) => updateProfile(role, body),
    onSuccess: async (profile) => {
      await setMyProfile(queryClient, role, profile)
      toast.success(TOAST_MESSAGES.profile.updateSuccess)
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      const fieldErrors = getProfileFieldErrors(role, error)
      if (Object.keys(fieldErrors).length > 0) {
        onFieldErrors(fieldErrors)
      } else {
        toast.error(TOAST_MESSAGES.profile.updateFailed)
      }
    },
  })
}
