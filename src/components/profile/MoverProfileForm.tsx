'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProfileChipField from '@/components/profile/ProfileChipField'
import ProfileForm from '@/components/profile/ProfileForm'
import ProfileImageField from '@/components/profile/ProfileImageField'
import ProfileTextField from '@/components/profile/ProfileTextField'
import { MOVER_MYPAGE_PATH } from '@/constants/navigation'
import { REGION_OPTIONS } from '@/constants/regions'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { Me } from '@/features/auth/types'
import { useCreateProfile } from '@/features/profile/hooks/useCreateProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { isSameSelection } from '@/features/profile/lib/selection'
import {
  getCareerYearsError,
  getDescriptionError,
  getIntroError,
  getNicknameError,
  getSelectionError,
} from '@/features/profile/lib/validation'
import type {
  ProfileFieldErrors,
  ProfileFormMode,
  ProfileUpdate,
} from '@/features/profile/types'

type TextFieldName = 'nickname' | 'careerYears' | 'intro' | 'description'

type FieldName = TextFieldName | 'serviceTypes' | 'regions'

type FormValues = Record<TextFieldName, string> & {
  serviceTypes: ServiceType[]
  regions: string[]
}

function getSavedValues(profile: Me['moverProfile'] | undefined): FormValues {
  return {
    nickname: profile?.nickname ?? '',
    careerYears: profile?.careerYears?.toString() ?? '',
    intro: profile?.intro ?? '',
    description: profile?.description ?? '',
    serviceTypes: profile?.serviceTypes ?? [],
    regions: profile?.regions ?? [],
  }
}

type MoverProfileFormProps = {
  mode: ProfileFormMode
}

export default function MoverProfileForm({ mode }: MoverProfileFormProps) {
  const isEdit = mode === 'edit'
  const router = useRouter()
  const { user } = useCurrentUser()
  const saved = getSavedValues(isEdit ? user?.moverProfile : null)

  const [edits, setEdits] = useState<Partial<FormValues>>({})
  const values = { ...saved, ...edits }
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<ProfileFieldErrors>({})
  const createProfile = useCreateProfile('MOVER', setServerErrors)
  const updateProfile = useUpdateProfile('MOVER', setServerErrors)

  const nickname = values.nickname.trim()
  const careerYears = values.careerYears.trim()
  const intro = values.intro.trim()
  const description = values.description.trim()
  const { serviceTypes, regions } = values
  const errors: Record<FieldName, string | undefined> = {
    nickname: getNicknameError(nickname),
    careerYears: getCareerYearsError(careerYears),
    intro: getIntroError(intro),
    description: getDescriptionError(description),
    serviceTypes: getSelectionError(serviceTypes),
    regions: getSelectionError(regions),
  }
  const changes: ProfileUpdate = {}
  if (nickname !== saved.nickname) changes.nickname = nickname
  if (careerYears !== saved.careerYears) {
    changes.careerYears = Number(careerYears)
  }
  if (intro !== saved.intro) changes.intro = intro
  if (description !== saved.description) changes.description = description
  if (!isSameSelection(serviceTypes, saved.serviceTypes)) {
    changes.serviceTypes = serviceTypes
  }
  if (!isSameSelection(regions, saved.regions)) changes.regions = regions
  const canSubmit =
    Object.keys(changes).length > 0 &&
    [...Object.values(errors), ...Object.values(serverErrors)].every(
      (error) => !error,
    )
  const isSubmitting = isEdit
    ? updateProfile.isPending
    : createProfile.isPending || createProfile.isSuccess

  const submit = () => {
    if (isEdit) {
      updateProfile.mutate(changes, {
        onSuccess: () => router.push(MOVER_MYPAGE_PATH),
      })
    } else {
      createProfile.mutate({
        nickname,
        careerYears: Number(careerYears),
        intro,
        description,
        serviceTypes,
        regions,
      })
    }
  }

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
      setEdits((prev) => ({ ...prev, [field]: value }))
      clearServerError(field)
    },
    onBlur: () => touch(field),
    error: getError(field),
  })

  return (
    <ProfileForm
      submitLabel={isEdit ? '수정하기' : '시작하기'}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={submit}
      onCancel={isEdit ? () => router.push(MOVER_MYPAGE_PATH) : undefined}
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
            setEdits((prev) => ({ ...prev, serviceTypes: value }))
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
            setEdits((prev) => ({ ...prev, regions: value }))
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
