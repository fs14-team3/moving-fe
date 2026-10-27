'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type InputProps = ComponentProps<'input'> & {
  error?: string
  wrapperClassName?: string
}

// 모바일·태블릿 327×54 / 데스크톱 640×64
const WRAPPER = 'w-[327px] lg:w-160'

const FIELD =
  'flex h-[54px] items-center gap-2 rounded-2xl border bg-white px-4 transition-colors has-disabled:bg-background-200 lg:h-16 lg:px-6'

// 에러일 때는 포커스 중에도 빨간 테두리를 유지한다.
const BORDER_DEFAULT = 'border-line-200 focus-within:border-primary-400'
const BORDER_ERROR = 'border-red-500'

const INPUT =
  'min-w-0 flex-1 bg-transparent text-sm text-black-400 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed lg:text-lg'

export default function Input({
  type = 'text',
  error,
  wrapperClassName,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const errorId = useId()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && isPasswordVisible ? 'text' : type

  // 페이지에서 넘긴 설명과 에러 메시지를 둘 다 연결한다.
  const describedBy =
    [ariaDescribedBy, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn(WRAPPER, wrapperClassName)}>
      <div className={cn(FIELD, error ? BORDER_ERROR : BORDER_DEFAULT)}>
        <input
          {...rest}
          type={inputType}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy}
          className={cn(INPUT, className)}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
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
          className="mt-1 pl-2 text-xs font-medium text-red-500 lg:mt-2 lg:text-base"
        >
          {error}
        </p>
      )}
    </div>
  )
}
