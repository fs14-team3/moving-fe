import { useId, type ChangeEvent, type ComponentProps } from 'react'
import Input from '@/components/common/input/Input'
import TextArea from '@/components/common/input/TextArea'
import ProfileField from '@/components/profile/ProfileField'

type ProfileTextFieldProps = {
  label: string
  name: string
  value: string
  placeholder: string
  required?: boolean
  multiline?: boolean
  type?: ComponentProps<'input'>['type']
  inputMode?: ComponentProps<'input'>['inputMode']
  autoComplete?: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

const FULL_WIDTH = 'w-full lg:w-full'

export default function ProfileTextField({
  label,
  required = false,
  multiline = false,
  onChange,
  ...rest
}: ProfileTextFieldProps) {
  const id = useId()
  const fieldProps = {
    ...rest,
    id,
    required,
    wrapperClassName: FULL_WIDTH,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
  }

  return (
    <ProfileField label={label} htmlFor={id} required={required}>
      {multiline ? <TextArea {...fieldProps} /> : <Input {...fieldProps} />}
    </ProfileField>
  )
}
