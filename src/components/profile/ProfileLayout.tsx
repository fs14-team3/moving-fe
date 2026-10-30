import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ProfileLayoutProps = {
  title: string
  description?: string
  className?: string
  children: ReactNode
}

export default function ProfileLayout({
  title,
  description,
  className,
  children,
}: ProfileLayoutProps) {
  return (
    <div className="px-6 pt-8 pb-10 lg:pt-14 lg:pb-20">
      <div className={cn('mx-auto max-w-[327px] lg:max-w-160', className)}>
        <div className="border-b border-line-100 pb-6 lg:pb-10">
          <h1 className="text-lg font-semibold text-black-400 lg:text-[32px]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-xs text-black-200 lg:mt-8 lg:text-xl">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
