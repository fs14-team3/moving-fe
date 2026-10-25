'use client'

import { Search, X } from 'lucide-react'
import { useState, type ComponentProps, type FocusEvent } from 'react'
import { cn } from '@/lib/cn'

type SearchInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  wrapperClassName?: string
}

const FORM =
  'flex h-13 w-full items-center gap-2 rounded-2xl bg-background-200 px-4 lg:h-16 lg:gap-3 lg:px-6'

const INPUT =
  'min-w-0 flex-1 bg-transparent text-sm text-black-400 outline-none placeholder:text-gray-400 lg:text-lg [&::-webkit-search-cancel-button]:hidden'

const ICON = 'size-5 shrink-0 text-gray-400 lg:size-6'

// value를 넘기면 제어 컴포넌트, 넘기지 않으면 내부 상태로 동작한다.
export default function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  wrapperClassName,
  className,
  placeholder = '텍스트를 입력해 주세요.',
  ...rest
}: SearchInputProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)

  const currentValue = value ?? innerValue
  // 입력 중일 때만 돋보기를 오른쪽으로 옮기고 지우기 버튼을 보여준다.
  const isTyping = isFocused && currentValue !== ''

  const changeValue = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onChange?.(next)
  }

  // 지우기 버튼처럼 폼 안의 요소로 포커스가 옮겨가는 경우는 포커스 유지로 본다.
  const handleBlur = (e: FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsFocused(false)
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch?.(currentValue)
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      className={cn(FORM, wrapperClassName)}
    >
      {!isTyping && <Search aria-hidden="true" className={ICON} />}
      <input
        {...rest}
        type="search"
        value={currentValue}
        placeholder={placeholder}
        onChange={(e) => changeValue(e.target.value)}
        className={cn(INPUT, className)}
      />
      {isTyping && (
        <>
          <button
            type="button"
            aria-label="검색어 지우기"
            // 클릭해도 포커스가 입력칸에 남도록 해서 바로 다시 입력할 수 있게 한다.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => changeValue('')}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-300 text-gray-400 lg:size-8"
          >
            <X className="size-3.5 lg:size-4" />
          </button>
          <button type="submit" aria-label="검색">
            <Search className={ICON} />
          </button>
        </>
      )}
    </form>
  )
}
