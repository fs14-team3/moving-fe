'use client'

import { useState } from 'react'
import ProfileChipField from '@/components/profile/ProfileChipField'
import ProfileForm from '@/components/profile/ProfileForm'
import ProfileImageField from '@/components/profile/ProfileImageField'
import ProfileTextField from '@/components/profile/ProfileTextField'
import { REGION_OPTIONS } from '@/constants/regions'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { useCreateProfile } from '@/features/profile/hooks/useCreateProfile'
import {
  getCareerYearsError,
  getDescriptionError,
  getIntroError,
  getNicknameError,
  getSelectionError,
} from '@/features/profile/lib/validation'
import type { ProfileFieldErrors } from '@/features/profile/types'

type TextFieldName = 'nickname' | 'careerYears' | 'intro' | 'description'

type FieldName = TextFieldName | 'serviceTypes' | 'regions'

const INITIAL_VALUES: Record<TextFieldName, string> = {
  nickname: '',
  careerYears: '',
  intro: '',
  description: '',
}

export default function MoverProfileForm() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<ProfileFieldErrors>({})
  const { mutate, isPending, isSuccess } = useCreateProfile(
    'MOVER',
    setServerErrors,
  )

  const nickname = values.nickname.trim()
  const careerYears = values.careerYears.trim()
  const intro = values.intro.trim()
  const description = values.description.trim()
  const errors: Record<FieldName, string | undefined> = {
    nickname: getNicknameError(nickname),
    careerYears: getCareerYearsError(careerYears),
    intro: getIntroError(intro),
    description: getDescriptionError(description),
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

  const textFieldProps = (field: TextFieldName) => ({
    name: field,
    value: values[field],
    required: true,
    onChange: (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      clearServerError(field)
    },
    onBlur: () => touch(field),
    error: getError(field),
  })

  return (
    <ProfileForm
      submitLabel="시작하기"
      canSubmit={canSubmit}
      isSubmitting={isPending || isSuccess}
      onSubmit={() =>
        mutate({
          nickname,
          careerYears: Number(careerYears),
          intro,
          description,
          serviceTypes,
          regions,
        })
      }
      className="lg:grid lg:grid-cols-2 lg:gap-x-30"
      actionsClassName="lg:mt-4 lg:w-125 lg:self-end"
    >
      <div className="lg:*:last:border-b-0">
        <ProfileImageField />
        <ProfileTextField
          label="별명"
          placeholder="사이트에 노출될 별명을 입력해 주세요"
          {...textFieldProps('nickname')}
        />
        <ProfileTextField
          label="경력"
          placeholder="기사님의 경력을 입력해 주세요"
          inputMode="numeric"
          {...textFieldProps('careerYears')}
        />
        <ProfileTextField
          label="한 줄 소개"
          placeholder="한 줄 소개를 입력해 주세요"
          {...textFieldProps('intro')}
        />
      </div>
      <div className="*:last:border-b-0">
        <ProfileTextField
          multiline
          label="상세 설명"
          placeholder="상세 내용을 입력해 주세요"
          {...textFieldProps('description')}
        />
        <ProfileChipField
          label="제공 서비스"
          required
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
          label="서비스 가능 지역"
          required
          options={REGION_OPTIONS}
          multiple
          value={regions}
          onChange={(value) => {
            setRegions(value)
            touch('regions')
            clearServerError('regions')
          }}
          error={getError('regions')}
          className="grid w-fit grid-cols-5"
        />
      </div>
    </ProfileForm>
  )
}
