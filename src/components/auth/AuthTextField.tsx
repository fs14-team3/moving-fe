import { useId, type ComponentProps } from 'react'
import Input from '@/components/common/input/Input'

type AuthTextFieldProps = ComponentProps<typeof Input> & {
  label: string
}

export default function AuthTextField({ label, ...rest }: AuthTextFieldProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <label htmlFor={id} className="text-sm/6 text-black-400 md:text-xl/8">
        {label}
      </label>
      <Input {...rest} id={id} wrapperClassName="w-full lg:w-full" />
    </div>
  )
}
