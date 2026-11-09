import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { PASSWORD_RULE_MESSAGE } from '@/features/auth/lib/validation'
import { queryKeys } from '@/lib/queryKeys'
import type { Me } from '@/features/auth/types'
import { updateBasicInfo } from '@/features/profile/api'
import type {
  BasicInfoField,
  BasicInfoFieldErrors,
} from '@/features/profile/types'
import { isApiError, isUnauthorized } from '@/lib/api-error'

const SERVER_FIELD_ERROR: Record<BasicInfoField, string> = {
  name: '이름을 다시 확인해 주세요.',
  email: '이메일을 다시 확인해 주세요.',
  phone: '전화번호를 다시 확인해 주세요.',
  currentPassword: '현재 비밀번호를 다시 확인해 주세요.',
  newPassword: PASSWORD_RULE_MESSAGE,
}

function isBasicInfoField(field: string): field is BasicInfoField {
  return Object.hasOwn(SERVER_FIELD_ERROR, field)
}

function getBasicInfoFieldErrors(error: unknown) {
  const fieldErrors: BasicInfoFieldErrors = {}
  if (!isApiError(error)) return fieldErrors
  for (const { field, reason } of error.details ?? []) {
    if (isBasicInfoField(field)) {
      fieldErrors[field] ??= reason || SERVER_FIELD_ERROR[field]
    }
  }
  return fieldErrors
}

export function useUpdateBasicInfo(
  onFieldErrors: (errors: BasicInfoFieldErrors) => void,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBasicInfo,
    onSuccess: async (me) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.me(),
        exact: true,
      })
      queryClient.setQueryData<Me | null>(queryKeys.user.me(), me)
      toast.success(TOAST_MESSAGES.profile.basicInfoUpdateSuccess)
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      const fieldErrors = getBasicInfoFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        onFieldErrors(fieldErrors)
      } else {
        toast.error(TOAST_MESSAGES.profile.basicInfoUpdateFailed)
      }
    },
  })
}
