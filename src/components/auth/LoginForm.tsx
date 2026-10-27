'use client'

import { useState } from 'react'
import AuthField from '@/components/auth/AuthField'
import AuthForm from '@/components/auth/AuthForm'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthPrompt from '@/components/auth/AuthPrompt'
import { LOGIN_PATH, SIGNUP_PATH } from '@/features/auth/lib/paths'
import type { Role } from '@/features/auth/types'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { getEmailError, getPasswordError } from '@/features/auth/lib/validation'

const TITLE: Record<Role, string> = {
  CUSTOMER: '일반 유저 로그인',
  MOVER: '기사님 로그인',
}

export default function LoginForm({ role }: { role: Role }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const { mutate, isPending, isSuccess } = useLogin()

  const trimmedEmail = email.trim()
  const emailError = getEmailError(trimmedEmail)
  const passwordError = getPasswordError(password)

  return (
    <>
      <AuthHeader title={TITLE[role]} role={role} paths={LOGIN_PATH} />

      <AuthForm
        submitLabel="로그인"
        canSubmit={!emailError && !passwordError}
        isSubmitting={isPending || isSuccess}
        onSubmit={() => mutate({ role, email: trimmedEmail, password })}
      >
        <AuthField
          label="이메일"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="이메일을 입력해 주세요"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={touched.email ? emailError : undefined}
        />
        <AuthField
          label="비밀번호"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={touched.password ? passwordError : undefined}
        />
      </AuthForm>

      <AuthPrompt
        question="아직 무빙 회원이 아니신가요?"
        linkLabel="이메일로 회원가입하기"
        href={SIGNUP_PATH[role]}
        className="mt-4 md:mt-6"
      />
    </>
  )
}
