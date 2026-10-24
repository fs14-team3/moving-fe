'use client'

import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useId, useState, type ComponentProps, type FormEvent } from 'react'
import Button from '@/components/common/Button'
import { LOGIN_PATH, SIGNUP_PATH } from '@/features/auth/lib/paths'
import type { Role } from '@/features/auth/types'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { getEmailError, getPasswordError } from '@/features/auth/lib/validation'
import { cn } from '@/lib/cn'

const PAGE: Record<
  Role,
  { title: string; otherRole: Role; otherQuestion: string; otherLink: string }
> = {
  CUSTOMER: {
    title: '일반 유저 로그인',
    otherRole: 'MOVER',
    otherQuestion: '기사님이신가요?',
    otherLink: '기사님 전용 페이지',
  },
  MOVER: {
    title: '기사님 로그인',
    otherRole: 'CUSTOMER',
    otherQuestion: '일반 유저라면?',
    otherLink: '일반 유저 전용 페이지',
  },
}

const LINK = 'font-semibold text-primary-400 underline underline-offset-2'

const FIELD =
  'flex h-[54px] items-center gap-2 rounded-2xl border bg-gray-50 px-4 transition-colors lg:h-16 lg:px-6'

const INPUT =
  'min-w-0 flex-1 bg-transparent text-base text-black-400 outline-none placeholder:text-gray-400 md:text-lg'

type FieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

// TODO(#65): #10의 공통 Input으로 교체
function Field({ label, error, type, ...rest }: FieldProps) {
  const id = useId()
  const errorId = useId()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <label htmlFor={id} className="text-sm/6 text-black-400 md:text-xl/8">
        {label}
      </label>
      <div>
        <div
          className={cn(
            FIELD,
            error
              ? 'border-red-500'
              : 'border-line-200 focus-within:border-primary-400',
          )}
        >
          <input
            {...rest}
            id={id}
            type={isPassword && isPasswordVisible ? 'text' : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={INPUT}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={
                isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
              }
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              className="shrink-0 text-gray-400"
            >
              {isPasswordVisible ? (
                <Eye className="size-5 lg:size-6" />
              ) : (
                <EyeOff className="size-5 lg:size-6" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1 pl-2 text-xs font-medium text-red-500 md:mt-2 md:text-base"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginForm({ role }: { role: Role }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const { mutate, isPending, isSuccess } = useLogin()

  const trimmedEmail = email.trim()
  const emailError = getEmailError(trimmedEmail)
  const passwordError = getPasswordError(password)
  const isValid = !emailError && !passwordError
  const isSubmitting = isPending || isSuccess
  const page = PAGE[role]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    mutate({ role, email: trimmedEmail, password })
  }

  return (
    <>
      <h1 className="sr-only">{page.title}</h1>
      <Link href="/">
        <Image
          src="/assets/logos/text.png"
          alt="무빙"
          width={266}
          height={138}
          loading="eager"
          className="block h-11 w-auto md:h-[54px]"
        />
      </Link>
      <p className="mt-6 text-xs text-black-200 md:mt-8 md:text-xl/8">
        {page.otherQuestion}{' '}
        <Link href={LOGIN_PATH[page.otherRole]} className={LINK}>
          {page.otherLink}
        </Link>
      </p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-10 flex w-[327px] flex-col gap-4 md:mt-12 md:w-140 md:gap-8 lg:w-160"
      >
        <Field
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
        <Field
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
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting || undefined}
          icon={
            isSubmitting && (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin lg:size-6"
              />
            )
          }
          className="mt-4 md:mt-6 md:h-15 md:w-140 md:text-lg"
        >
          로그인
        </Button>
      </form>

      <p className="mt-4 text-xs text-black-200 md:mt-6 md:text-xl/8">
        아직 무빙 회원이 아니신가요?{' '}
        <Link href={SIGNUP_PATH[role]} className={LINK}>
          이메일로 회원가입하기
        </Link>
      </p>
    </>
  )
}
