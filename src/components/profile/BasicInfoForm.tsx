'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProfileForm from '@/components/profile/ProfileForm'
import ProfileTextField from '@/components/profile/ProfileTextField'
import { MOVER_MYPAGE_PATH } from '@/constants/navigation'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import {
  getEmailError,
  getNameError,
  getNewPasswordError,
  getPasswordConfirmError,
  getPasswordError,
  getPhoneError,
  toPhoneDigits,
} from '@/features/auth/lib/validation'
import type { Role } from '@/features/auth/types'
import { useUpdateBasicInfo } from '@/features/profile/hooks/useUpdateBasicInfo'
import type { BasicInfoUpdate } from '@/features/profile/types'

type FieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'currentPassword'
  | 'newPassword'
  | 'newPasswordConfirm'

type FieldErrors = Partial<Record<FieldName, string>>

type BasicInfoFormProps = {
  role: Role
}

export default function BasicInfoForm({ role }: BasicInfoFormProps) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const savedName = user?.name ?? ''
  const savedEmail = user?.email ?? ''
  const savedPhone = user?.phone ?? ''

  const [edits, setEdits] = useState<Partial<Record<FieldName, string>>>({})
  const values: Record<FieldName, string> = {
    name: savedName,
    email: savedEmail,
    phone: savedPhone,
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
    ...edits,
  }
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const { mutate, isPending } = useUpdateBasicInfo(setServerErrors)

  const name = values.name.trim()
  const email = values.email.trim()
  const isChangingPassword = Boolean(
    values.currentPassword || values.newPassword || values.newPasswordConfirm,
  )
  const errors: FieldErrors = {
    name: getNameError(name),
    email: getEmailError(email),
    phone: getPhoneError(values.phone),
  }
  if (isChangingPassword) {
    errors.currentPassword = getPasswordError(values.currentPassword)
    errors.newPassword = getNewPasswordError(values.newPassword)
    errors.newPasswordConfirm = getPasswordConfirmError(
      values.newPassword,
      values.newPasswordConfirm,
    )
  }

  const body: BasicInfoUpdate = {}
  if (name !== savedName) body.name = name
  if (email !== savedEmail) body.email = email
  if (values.phone !== savedPhone) body.phone = values.phone
  if (isChangingPassword) {
    body.currentPassword = values.currentPassword
    body.newPassword = values.newPassword
  }

  const canSubmit =
    Object.keys(body).length > 0 &&
    [...Object.values(errors), ...Object.values(serverErrors)].every(
      (error) => !error,
    )

  const submit = () =>
    mutate(body, {
      onSuccess: () => {
        if (role === 'MOVER') router.push(MOVER_MYPAGE_PATH)
        else setEdits({})
      },
    })

  const cancel = () => {
    if (role === 'MOVER') router.push(MOVER_MYPAGE_PATH)
    else router.back()
  }

  const fieldProps = (
    field: FieldName,
    normalize: (value: string) => string = (value) => value,
  ) => ({
    name: field,
    value: values[field],
    onChange: (value: string) => {
      setEdits((prev) => ({ ...prev, [field]: normalize(value) }))
      setServerErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
    error: (touched[field] ? errors[field] : undefined) ?? serverErrors[field],
  })

  return (
    <ProfileForm
      submitLabel="수정하기"
      canSubmit={canSubmit}
      isSubmitting={isPending}
      onSubmit={submit}
      onCancel={cancel}
      className="lg:grid lg:grid-cols-2 lg:gap-x-30"
      actionsClassName="lg:mt-4 lg:w-125 lg:self-end"
    >
      <div className="lg:*:last:border-b-0">
        <ProfileTextField
          label="이름"
          autoComplete="name"
          placeholder="성함을 입력해 주세요"
          {...fieldProps('name')}
        />
        <ProfileTextField
          label="이메일"
          type="email"
          autoComplete="email"
          placeholder="이메일을 입력해 주세요"
          {...fieldProps('email')}
        />
        <ProfileTextField
          label="전화번호"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="숫자만 입력해 주세요"
          {...fieldProps('phone', toPhoneDigits)}
        />
      </div>
      <div className="*:last:border-b-0">
        <ProfileTextField
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          placeholder="현재 비밀번호를 입력해 주세요"
          {...fieldProps('currentPassword')}
        />
        <ProfileTextField
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 입력해 주세요"
          {...fieldProps('newPassword')}
        />
        <ProfileTextField
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          placeholder="새 비밀번호를 다시 한번 입력해 주세요"
          {...fieldProps('newPasswordConfirm')}
        />
      </div>
    </ProfileForm>
  )
}
