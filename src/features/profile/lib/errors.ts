import type { Role } from '@/features/auth/types'
import type { ProfileField, ProfileFieldErrors } from '@/features/profile/types'
import { isApiError } from '@/lib/api-error'

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

export function getProfileFieldErrors(role: Role, error: unknown) {
  const messages = SERVER_FIELD_ERROR[role]
  const fieldErrors: ProfileFieldErrors = {}
  if (!isApiError(error)) return fieldErrors
  for (const { field } of error.details ?? []) {
    const name = field.split('.')[0] as ProfileField
    if (Object.hasOwn(messages, name)) fieldErrors[name] = messages[name]
  }
  return fieldErrors
}
