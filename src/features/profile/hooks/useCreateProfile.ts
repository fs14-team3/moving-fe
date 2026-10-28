import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PROFILE_EDIT_PATH } from '@/constants/navigation'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'
import { createProfile } from '@/features/profile/api'
import type {
  ProfileCreate,
  ProfileField,
  ProfileFieldErrors,
} from '@/features/profile/types'
import { isApiError, isUnauthorized } from '@/lib/api-error'

const PROFILE_FIELD = {
  CUSTOMER: 'customerProfile',
  MOVER: 'moverProfile',
} as const satisfies Record<Role, keyof Me>

const SELECTION_FIELD_ERROR: ProfileFieldErrors = {
  serviceTypes: '서비스를 다시 선택해 주세요.',
  regions: '지역을 다시 선택해 주세요.',
}

// TODO(#39): 이미지 입력란이 생기면 imageUrl 오류도 입력란에 표시
const SERVER_FIELD_ERROR: Record<Role, ProfileFieldErrors> = {
  CUSTOMER: SELECTION_FIELD_ERROR,
  MOVER: {
    nickname: '별명을 다시 확인해 주세요.',
    careerYears: '경력을 다시 확인해 주세요.',
    intro: '한 줄 소개를 다시 확인해 주세요.',
    description: '상세 설명을 다시 확인해 주세요.',
    ...SELECTION_FIELD_ERROR,
  },
}

function getProfileFieldErrors(role: Role, error: unknown) {
  const messages = SERVER_FIELD_ERROR[role]
  const fieldErrors: ProfileFieldErrors = {}
  if (!isApiError(error)) return fieldErrors
  for (const { field } of error.details ?? []) {
    const name = field.split('.')[0] as ProfileField
    if (Object.hasOwn(messages, name)) fieldErrors[name] = messages[name]
  }
  return fieldErrors
}

export function useCreateProfile(
  role: Role,
  onFieldErrors: (errors: ProfileFieldErrors) => void,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProfileCreate) => createProfile(role, body),
    onSuccess: async (profile) => {
      await queryClient.cancelQueries({ queryKey: meQueryKey, exact: true })
      queryClient.setQueryData<Me | null>(
        meQueryKey,
        (me) =>
          me && { ...me, hasProfile: true, [PROFILE_FIELD[role]]: profile },
      )
    },
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
