import Link from 'next/link'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'outlined'

type CommonProps = {
  variant?: Variant
  icon?: ReactNode
  done?: boolean
  className?: string
  children: ReactNode
}

// href가 있으면 Link, 없으면 button으로 렌더링한다. 각 태그의 나머지 속성은 그대로 전달한다.
type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'> & {
    href: string
  }

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined
  }

type ButtonProps = LinkButtonProps | NativeButtonProps

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

function getClassName({
  variant = 'solid',
  done = false,
  className,
}: Pick<CommonProps, 'variant' | 'done' | 'className'>) {
  return cn(
    BASE,
    SIZE,
    variant === 'outlined' && done ? DONE : VARIANT[variant],
    className,
  )
}

export default function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, done, className, icon, children, ...linkProps } = props
    return (
      <Link
        {...linkProps}
        className={getClassName({ variant, done, className })}
      >
        {children}
        {icon}
      </Link>
    )
  }

  const {
    variant,
    done,
    className,
    icon,
    children,
    type = 'button',
    ...buttonProps
  } = props
  return (
    <button
      {...buttonProps}
      type={type}
      className={getClassName({ variant, done, className })}
    >
      {children}
      {icon}
    </button>
  )
}
