'use client'

import { useState, type ChangeEvent } from 'react'
import AuthField from '@/components/auth/AuthField'
import AuthForm from '@/components/auth/AuthForm'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthPrompt from '@/components/auth/AuthPrompt'
import { LOGIN_PATH, SIGNUP_PATH } from '@/features/auth/lib/paths'
import type { Role } from '@/features/auth/types'
import { useSignup } from '@/features/auth/hooks/useSignup'
import {
  getEmailError,
  getNameError,
  getNewPasswordError,
  getPasswordConfirmError,
  getPhoneError,
  toPhoneDigits,
} from '@/features/auth/lib/validation'

const TITLE: Record<Role, string> = {
  CUSTOMER: '일반 유저 회원가입',
  MOVER: '기사님 회원가입',
}

type FieldName = 'name' | 'email' | 'phone' | 'password' | 'passwordConfirm'

type FieldErrors = Partial<Record<FieldName, string>>

const INITIAL_VALUES: Record<FieldName, string> = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
}

export default function SignupForm({ role }: { role: Role }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  )
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const { mutate, isPending, isSuccess } = useSignup(setServerErrors)

  const name = values.name.trim()
  const email = values.email.trim()
  const errors: FieldErrors = {
    name: getNameError(name),
    email: getEmailError(email),
    phone: getPhoneError(values.phone),
    password: getNewPasswordError(values.password),
    passwordConfirm: getPasswordConfirmError(
      values.password,
      values.passwordConfirm,
    ),
  }
  const canSubmit = [
    ...Object.values(errors),
    ...Object.values(serverErrors),
  ].every((error) => !error)

  const fieldProps = (
    field: FieldName,
    normalize: (value: string) => string = (value) => value,
  ) => ({
    name: field,
    value: values[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: normalize(event.target.value) }))
      setServerErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
    error: (touched[field] ? errors[field] : undefined) ?? serverErrors[field],
  })

  return (
    <>
      <AuthHeader title={TITLE[role]} role={role} paths={SIGNUP_PATH} />

      <AuthForm
        submitLabel="시작하기"
        canSubmit={canSubmit}
        isSubmitting={isPending || isSuccess}
        onSubmit={() =>
          mutate({
            role,
            name,
            email,
            phone: values.phone,
            password: values.password,
          })
        }
      >
        <AuthField
          label="이름"
          type="text"
          autoComplete="name"
          placeholder="성함을 입력해 주세요"
          {...fieldProps('name')}
        />
        <AuthField
          label="이메일"
          type="email"
          autoComplete="email"
          placeholder="이메일을 입력해 주세요"
          {...fieldProps('email')}
        />
        <AuthField
          label="전화번호"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="숫자만 입력해 주세요"
          {...fieldProps('phone', toPhoneDigits)}
        />
        <AuthField
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호를 입력해 주세요"
          {...fieldProps('password')}
        />
        <AuthField
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호를 다시 한번 입력해 주세요"
          {...fieldProps('passwordConfirm')}
        />
      </AuthForm>

      <AuthPrompt
        question="이미 무빙 회원이신가요?"
        linkLabel="로그인"
        href={LOGIN_PATH[role]}
        className="mt-4 md:mt-6"
      />
    </>
  )
}
