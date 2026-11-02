import { ReactNode } from 'react'

type MoveRequestStepProps = {
  title: string
  isActive: boolean
  children: ReactNode
  direction?: 'row'
}

export default function MoveRequestStep({
  title,
  isActive,
  children,
  direction,
}: MoveRequestStepProps) {
  return (
    <section
      className={`py-8 ${isActive ? 'block' : 'hidden md:block'} md:flex ${direction === 'row' ? 'md:justify-between md:gap-8' : 'md:flex-col md:gap-4'}`}
    >
      <h2 className="hidden text-lg leading-6 font-bold md:block">{title}</h2>

      {children}
    </section>
  )
}
