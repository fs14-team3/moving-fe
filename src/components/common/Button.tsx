import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'solid' | 'outlined'
type Size = 'md' | 'lg'

type CommonProps = {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  done?: boolean
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

// href가 있으면 Link, 없으면 button으로 렌더링한다.
type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: string
  }

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold transition-colors'

const SIZE: Record<Size, string> = {
  md: 'h-[54px] text-base',
  lg: 'h-15 text-lg',
}

const VARIANT: Record<Variant, string> = {
  solid:
    'border-transparent bg-primary-500 text-white hover:brightness-90 disabled:bg-gray-300 disabled:hover:brightness-100',
  outlined:
    'border-primary-400 bg-transparent text-primary-400 active:bg-primary-100 active:shadow-md disabled:border-gray-300 disabled:text-gray-400',
}

const DONE = 'border-gray-300 bg-transparent text-gray-400'

export default function Button({
  variant = 'solid',
  size = 'md',
  icon,
  done = false,
  fullWidth = true,
  className = '',
  children,
  href,
  ...rest
}: ButtonProps) {
  // done은 outlined의 색을 덮어쓰지 않고 대체한다. (같은 속성 클래스가 겹치면 적용 순서를 보장할 수 없음)
  const variantClass = variant === 'outlined' && done ? DONE : VARIANT[variant]

  const classes = [
    BASE,
    SIZE[size],
    variantClass,
    fullWidth ? 'w-full' : 'px-8',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {children}
      {icon}
    </>
  )

  if (href !== undefined) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  const { type = 'button', ...buttonProps } = rest
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  )
}
