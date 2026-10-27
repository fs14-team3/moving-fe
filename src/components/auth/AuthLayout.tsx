import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Role } from '@/features/auth/types'
import { cn } from '@/lib/cn'

const ILLUSTRATION: Record<
  Role,
  {
    src: string
    width: number
    height: number
    sizes: string
    className: string
  }
> = {
  CUSTOMER: {
    src: '/assets/images/character-box.webp',
    width: 550,
    height: 801,
    sizes: '(min-width: 1200px) 208px, 132px',
    className:
      'md:-right-14 md:-bottom-12 md:w-33 lg:right-auto lg:bottom-2 lg:left-full lg:ml-9 lg:w-52',
  },
  MOVER: {
    src: '/assets/images/truck.webp',
    width: 870,
    height: 658,
    sizes: '(min-width: 1200px) 340px, 204px',
    className:
      'md:-right-20 md:-bottom-9 md:w-51 lg:right-auto lg:bottom-5 lg:left-full lg:-ml-9 lg:w-85',
  },
}

type AuthLayoutProps = {
  role: Role
  children: ReactNode
}

export default function AuthLayout({ role, children }: AuthLayoutProps) {
  const { className, ...illustration } = ILLUSTRATION[role]

  return (
    <div className="flex min-h-page items-start justify-center overflow-x-clip bg-gray-50 px-6 pt-19 pb-12 md:items-center md:bg-primary-400 md:py-16 lg:py-11">
      <div className="relative">
        <div className="flex flex-col items-center md:w-160 md:rounded-[40px] md:bg-gray-50 md:pt-22 md:pb-17 lg:w-185 lg:pt-18 lg:pb-12">
          {children}
        </div>
        <Image
          {...illustration}
          alt=""
          loading="eager"
          className={cn(
            'pointer-events-none absolute hidden h-auto md:block',
            className,
          )}
        />
      </div>
    </div>
  )
}
