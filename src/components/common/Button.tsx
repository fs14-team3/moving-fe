import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'outlined'

type CommonProps = {
  variant?: Variant
  icon?: ReactNode
  done?: boolean
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

// 모바일·태블릿 327×54 / 데스크톱 640×60. 페이지마다 다른 크기는 className으로 덮어쓴다.
const SIZE = 'h-[54px] w-[327px] text-base lg:h-15 lg:w-160 lg:text-lg'

const VARIANT: Record<Variant, string> = {
  solid:
    'border-transparent bg-primary-500 text-white hover:brightness-90 disabled:bg-gray-300 disabled:hover:brightness-100',
  outlined:
    'border-primary-400 bg-transparent text-primary-400 hover:bg-primary-100/50 active:bg-primary-100 active:shadow-md disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent',
}

const DONE = 'border-gray-300 bg-transparent text-gray-400'

export default function Button({
  variant = 'solid',
  icon,
  done = false,
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = cn(
    BASE,
    SIZE,
    variant === 'outlined' && done ? DONE : VARIANT[variant],
    className,
  )

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
