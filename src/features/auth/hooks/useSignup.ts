import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { signup } from '@/features/auth/api'
import { resetSession } from '@/features/auth/lib/session'
import type { SignupRequest } from '@/features/auth/types'
import { PASSWORD_RULE_MESSAGE } from '@/features/auth/lib/validation'
import { isApiError } from '@/lib/api-error'

type SignupField = Exclude<keyof SignupRequest, 'role'>

export type SignupFieldErrors = Partial<Record<SignupField, string>>

const SERVER_FIELD_ERROR: Record<SignupField, string> = {
  name: '이름을 다시 확인해 주세요.',
  email: '이메일을 다시 확인해 주세요.',
  phone: '전화번호를 다시 확인해 주세요.',
  password: PASSWORD_RULE_MESSAGE,
}

function isSignupField(field: string): field is SignupField {
  return Object.hasOwn(SERVER_FIELD_ERROR, field)
}

function getSignupFieldErrors(error: unknown) {
  const fieldErrors: SignupFieldErrors = {}
  if (!isApiError(error)) return fieldErrors
  if (error.code === 'EMAIL_ALREADY_EXISTS') {
    return { email: '이미 가입된 이메일입니다.' }
  }
  for (const { field } of error.details ?? []) {
    if (isSignupField(field)) fieldErrors[field] = SERVER_FIELD_ERROR[field]
  }
  return fieldErrors
}

export function useSignup(onFieldErrors: (errors: SignupFieldErrors) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signup,
    onSuccess: (user) => resetSession(queryClient, user),
    onError: (error) => {
      const fieldErrors = getSignupFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        onFieldErrors(fieldErrors)
      } else {
        toast.error(TOAST_MESSAGES.auth.signupFailed)
      }
    },
  })
}
