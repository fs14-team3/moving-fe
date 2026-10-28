import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type SelectChipProps = Omit<ComponentProps<'button'>, 'type'> & {
  selected?: boolean
}

const BASE =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed lg:h-[46px] lg:px-5 lg:text-lg'

const SELECTED = 'border-primary-400 bg-primary-100 text-primary-400'

const UNSELECTED =
  'border-line-200 bg-background-200 text-black-400 hover:bg-background-300 disabled:hover:bg-background-200'

export default function SelectChip({
  selected = false,
  className,
  ...rest
}: SelectChipProps) {
  return (
    <button
      {...rest}
      type="button"
      aria-pressed={selected}
      className={cn(BASE, selected ? SELECTED : UNSELECTED, className)}
    />
  )
}
