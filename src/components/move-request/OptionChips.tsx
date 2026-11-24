import { useId } from 'react'
import SelectChip from '@/components/common/SelectChip'
import type { Option } from '@/lib/options'

type OptionChipsProps<T> = {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
}

export default function OptionChips<T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
}: OptionChipsProps<T>) {
  const labelId = useId()

  return (
    <div className="flex flex-col gap-3">
      <p id={labelId} className="text-base leading-6 font-medium">
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex flex-wrap gap-2 lg:gap-3"
      >
        {options.map((option) => (
          <SelectChip
            key={String(option.value)}
            selected={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </SelectChip>
        ))}
      </div>
    </div>
  )
}
