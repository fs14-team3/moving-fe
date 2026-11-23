import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type MoveRequestStepProps = {
  title: string
  isActive: boolean
  isOnPage: boolean
  children: ReactNode
  direction?: 'row'
}

export default function MoveRequestStep({
  title,
  isActive,
  isOnPage,
  children,
  direction,
}: MoveRequestStepProps) {
  return (
    <section
      className={cn(
        'py-8',
        isActive ? 'block' : 'hidden',
        isOnPage ? 'md:flex' : 'md:hidden',
        direction === 'row'
          ? 'md:justify-between md:gap-8'
          : 'md:flex-col md:gap-4',
      )}
    >
      <h2 className="hidden text-lg leading-6 font-bold md:block">{title}</h2>

      {children}
    </section>
  )
}
