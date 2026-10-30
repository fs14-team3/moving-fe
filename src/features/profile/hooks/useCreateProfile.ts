import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROFILE_EDIT_PATH } from '@/constants/navigation'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import type { Role } from '@/features/auth/types'
import { createProfile } from '@/features/profile/api'
import { setMyProfile } from '@/features/profile/lib/cache'
import { getProfileFieldErrors } from '@/features/profile/lib/errors'
import type {
  ProfileCreate,
  ProfileFieldErrors,
} from '@/features/profile/types'
import { isApiError, isUnauthorized } from '@/lib/api-error'

export function useCreateProfile(
  role: Role,
  onFieldErrors: (errors: ProfileFieldErrors) => void,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProfileCreate) => createProfile(role, body),
    onSuccess: (profile) => setMyProfile(queryClient, role, profile),
    onError: (error) => {
      if (isUnauthorized(error)) return
      if (isApiError(error) && error.code === 'PROFILE_ALREADY_EXISTS') {
        window.location.replace(PROFILE_EDIT_PATH[role])
        return
      }
      const fieldErrors = getProfileFieldErrors(role, error)
      if (Object.keys(fieldErrors).length > 0) {
        onFieldErrors(fieldErrors)
      } else {
        toast.error(TOAST_MESSAGES.profile.profileCreateFailed)
      }
    },
  })
}
