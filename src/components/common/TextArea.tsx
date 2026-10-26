import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type TextAreaProps = ComponentProps<'textarea'> & {
  error?: string
  wrapperClassName?: string
}

// 모바일·태블릿 327×160 / 데스크톱 560×160
const WRAPPER = 'w-[327px] lg:w-140'

// 내용이 길어지면 textarea 안에서 스크롤된다.
const TEXTAREA =
  'block h-40 w-full resize-none overflow-y-auto rounded-2xl border bg-white px-4 py-4 text-sm leading-6 text-black-400 outline-none [scrollbar-width:thin] placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-background-200 lg:px-6 lg:py-5 lg:text-base lg:leading-8'

const BORDER_DEFAULT = 'border-line-200'
const BORDER_ERROR = 'border-red-500'

export default function TextArea({
  error,
  wrapperClassName,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextAreaProps) {
  const errorId = useId()

  // 페이지에서 넘긴 설명과 에러 메시지를 둘 다 연결한다.
  const describedBy =
    [ariaDescribedBy, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn(WRAPPER, wrapperClassName)}>
      <textarea
        {...rest}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={cn(
          TEXTAREA,
          error ? BORDER_ERROR : BORDER_DEFAULT,
          className,
        )}
      />
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
