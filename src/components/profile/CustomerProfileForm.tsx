'use client'

import { useState } from 'react'
import ProfileChipField from '@/components/profile/ProfileChipField'
import ProfileForm from '@/components/profile/ProfileForm'
import ProfileImageField from '@/components/profile/ProfileImageField'
import { REGION_OPTIONS } from '@/constants/regions'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { useCreateProfile } from '@/features/profile/hooks/useCreateProfile'
import { getSelectionError } from '@/features/profile/lib/validation'
import type { ProfileFieldErrors } from '@/features/profile/types'

type FieldName = 'serviceTypes' | 'regions'

export default function CustomerProfileForm() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<ProfileFieldErrors>({})
  const { mutate, isPending, isSuccess } = useCreateProfile(
    'CUSTOMER',
    setServerErrors,
  )

  const errors: Record<FieldName, string | undefined> = {
    serviceTypes: getSelectionError(serviceTypes),
    regions: getSelectionError(regions),
  }
  const canSubmit = [
    ...Object.values(errors),
    ...Object.values(serverErrors),
  ].every((error) => !error)

  const touch = (field: FieldName) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const clearServerError = (field: FieldName) =>
    setServerErrors((prev) => ({ ...prev, [field]: undefined }))

  const getError = (field: FieldName) =>
    (touched[field] ? errors[field] : undefined) ?? serverErrors[field]

  return (
    <ProfileForm
      canSubmit={canSubmit}
      isSubmitting={isPending || isSuccess}
      onSubmit={() => mutate({ serviceTypes, regions })}
    >
      <ProfileImageField />
      <ProfileChipField
        label="이용 서비스"
        description="*이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!"
        options={SERVICE_TYPE_OPTIONS}
        multiple
        value={serviceTypes}
        onChange={(value) => {
          setServiceTypes(value)
          touch('serviceTypes')
          clearServerError('serviceTypes')
        }}
        error={getError('serviceTypes')}
      />
      <ProfileChipField
        label="내가 사는 지역"
        description="*내가 사는 지역은 언제든 수정 가능해요!"
        options={REGION_OPTIONS}
        value={regions}
        onChange={(value) => {
          setRegions(value)
          touch('regions')
          clearServerError('regions')
        }}
        error={getError('regions')}
        className="grid w-fit grid-cols-5"
      />
    </ProfileForm>
  )
}
