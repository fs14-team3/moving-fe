import type { Role } from '@/features/auth/types'
import type { ProfileField, ProfileFieldErrors } from '@/features/profile/types'
import { isApiError } from '@/lib/api-error'

const IMAGE_UPLOAD_FAILED = '이미지를 올리지 못했습니다. 다시 선택해 주세요.'

const COMMON_FIELD_ERROR: ProfileFieldErrors = {
  imageUrl: '이미지를 다시 선택해 주세요.',
  serviceTypes: '서비스를 다시 선택해 주세요.',
  regions: '지역을 다시 선택해 주세요.',
}

const SERVER_FIELD_ERROR: Record<Role, ProfileFieldErrors> = {
  CUSTOMER: COMMON_FIELD_ERROR,
  MOVER: {
    nickname: '별명을 다시 확인해 주세요.',
    careerYears: '경력을 다시 확인해 주세요.',
    intro: '한 줄 소개를 다시 확인해 주세요.',
    description: '상세 설명을 다시 확인해 주세요.',
    ...COMMON_FIELD_ERROR,
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

export function getImageUploadError(error: unknown) {
  const reason = isApiError(error)
    ? error.details?.find(({ field }) => field === 'file')?.reason
    : undefined
  return reason || IMAGE_UPLOAD_FAILED
}
