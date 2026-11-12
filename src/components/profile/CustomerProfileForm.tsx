'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProfileChipField from '@/components/profile/ProfileChipField'
import ProfileForm from '@/components/profile/ProfileForm'
import ProfileImageField from '@/components/profile/ProfileImageField'
import { REGION_OPTIONS } from '@/constants/regions'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useCreateProfile } from '@/features/profile/hooks/useCreateProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { isSameSelection } from '@/features/profile/lib/selection'
import { getSelectionError } from '@/features/profile/lib/validation'
import type {
  ProfileField,
  ProfileFieldErrors,
  ProfileFormMode,
  ProfileUpdate,
} from '@/features/profile/types'

type FieldName = 'serviceTypes' | 'regions'

const DESCRIPTION: Record<ProfileFormMode, Record<FieldName, string>> = {
  register: {
    serviceTypes: '*이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!',
    regions: '*내가 사는 지역은 언제든 수정 가능해요!',
  },
  edit: {
    serviceTypes: '*견적 요청 시 이용 서비스를 선택할 수 있어요.',
    regions: '*견적 요청 시 지역을 설정할 수 있어요.',
  },
}

type CustomerProfileFormProps = {
  mode: ProfileFormMode
}

export default function CustomerProfileForm({
  mode,
}: CustomerProfileFormProps) {
  const isEdit = mode === 'edit'
  const router = useRouter()
  const { user } = useCurrentUser()
  const savedProfile = isEdit ? user?.customerProfile : null
  const savedImageUrl = savedProfile?.imageUrl ?? null
  const savedServiceTypes = savedProfile?.serviceTypes ?? []
  const savedRegions = savedProfile?.regions ?? []

  const [edits, setEdits] = useState<{
    imageUrl?: string
    serviceTypes?: ServiceType[]
    regions?: string[]
  }>({})
  const imageUrl = edits.imageUrl ?? savedImageUrl
  const serviceTypes = edits.serviceTypes ?? savedServiceTypes
  const regions = edits.regions ?? savedRegions
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<ProfileFieldErrors>({})
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const createProfile = useCreateProfile('CUSTOMER', setServerErrors)
  const updateProfile = useUpdateProfile('CUSTOMER', setServerErrors)

  const errors: Record<FieldName, string | undefined> = {
    serviceTypes: getSelectionError(serviceTypes),
    regions: getSelectionError(regions),
  }
  const changes: ProfileUpdate = {}
  if (imageUrl !== savedImageUrl) changes.imageUrl = imageUrl
  if (!isSameSelection(serviceTypes, savedServiceTypes)) {
    changes.serviceTypes = serviceTypes
  }
  if (!isSameSelection(regions, savedRegions)) changes.regions = regions
  const canSubmit =
    !isUploadingImage &&
    Object.keys(changes).length > 0 &&
    [...Object.values(errors), ...Object.values(serverErrors)].every(
      (error) => !error,
    )
  const isSubmitting = isEdit
    ? updateProfile.isPending
    : createProfile.isPending || createProfile.isSuccess

  const submit = () => {
    if (isEdit) updateProfile.mutate(changes)
    else createProfile.mutate({ imageUrl, serviceTypes, regions })
  }

  const touch = (field: FieldName) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const clearServerError = (field: ProfileField) =>
    setServerErrors((prev) => ({ ...prev, [field]: undefined }))

  const getError = (field: FieldName) =>
    (touched[field] ? errors[field] : undefined) ?? serverErrors[field]

  return (
    <ProfileForm
      submitLabel={isEdit ? '수정하기' : '시작하기'}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={submit}
      onCancel={isEdit ? () => router.back() : undefined}
    >
      <ProfileImageField
        imageUrl={imageUrl}
        error={serverErrors.imageUrl}
        onChange={(value) => {
          setEdits((prev) => ({ ...prev, imageUrl: value }))
          clearServerError('imageUrl')
        }}
        onUploadingChange={setIsUploadingImage}
      />
      <ProfileChipField
        label="이용 서비스"
        description={DESCRIPTION[mode].serviceTypes}
        options={SERVICE_TYPE_OPTIONS}
        multiple
        value={serviceTypes}
        onChange={(value) => {
          setEdits((prev) => ({ ...prev, serviceTypes: value }))
          touch('serviceTypes')
          clearServerError('serviceTypes')
        }}
        error={getError('serviceTypes')}
      />
      <ProfileChipField
        label="내가 사는 지역"
        description={DESCRIPTION[mode].regions}
        options={REGION_OPTIONS}
        value={regions}
        onChange={(value) => {
          setEdits((prev) => ({ ...prev, regions: value }))
          touch('regions')
          clearServerError('regions')
        }}
        error={getError('regions')}
        className="grid w-fit grid-cols-5"
      />
    </ProfileForm>
  )
}
