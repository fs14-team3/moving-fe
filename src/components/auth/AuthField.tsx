'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const FIELD =
  'flex h-[54px] items-center gap-2 rounded-2xl border bg-gray-50 px-4 transition-colors lg:h-16 lg:px-6'

const INPUT =
  'min-w-0 flex-1 bg-transparent text-base text-black-400 outline-none placeholder:text-gray-400 md:text-lg'

type AuthFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

// TODO(#65): #10의 공통 Input으로 교체
export default function AuthField({
  label,
  error,
  type,
  ...rest
}: AuthFieldProps) {
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
