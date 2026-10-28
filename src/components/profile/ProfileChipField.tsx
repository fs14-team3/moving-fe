import { useId } from 'react'
import SelectChip from '@/components/common/SelectChip'
import ProfileField from '@/components/profile/ProfileField'
import { cn } from '@/lib/cn'

type ProfileChipFieldProps<T extends string> = {
  label: string
  required?: boolean
  description?: string
  error?: string
  options: { value: T; label: string }[]
  value: T[]
  onChange: (value: T[]) => void
  multiple?: boolean
  className?: string
}

export default function ProfileChipField<T extends string>({
  label,
  required,
  description,
  error,
  options,
  value,
  onChange,
  multiple = false,
  className,
}: ProfileChipFieldProps<T>) {
  const labelId = useId()
  const messageId = useId()

  const toggle = (option: T) => {
    if (!multiple) {
      onChange([option])
      return
    }
    const next = value.includes(option)
      ? value.filter((selected) => selected !== option)
      : [...value, option]
    onChange(
      options.map((item) => item.value).filter((item) => next.includes(item)),
    )
  }

  const message = error ? (
    <p
      id={messageId}
      className="mt-2 pl-2 text-xs font-medium text-red-500 lg:text-base"
    >
      <span aria-hidden="true">* </span>
      {error}
    </p>
  ) : description ? (
    <p id={messageId} className="mt-2 text-xs text-gray-400 lg:text-base">
      {description}
    </p>
  ) : null

  return (
    <ProfileField
      label={label}
      labelId={labelId}
      required={required}
      message={message}
    >
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          'flex flex-wrap gap-x-2 gap-y-3 lg:gap-x-3.5 lg:gap-y-4.5',
          className,
        )}
      >
        {options.map((option) => (
          <SelectChip
            key={option.value}
            selected={value.includes(option.value)}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </SelectChip>
        ))}
      </div>
    </ProfileField>
  )
}
