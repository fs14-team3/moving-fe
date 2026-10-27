import { SERVICE_TYPE_OPTIONS } from '@/constants/services'
import Dropdown from './Dropdown'

type ServiceDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

const SERVICE_OPTIONS = [
  { label: '전체', value: 'all' },
  ...SERVICE_TYPE_OPTIONS,
]

export default function ServiceDropdown({
  value,
  onChange,
}: ServiceDropdownProps) {
  return (
    <Dropdown
      placeholder="서비스"
      options={SERVICE_OPTIONS}
      variant="service"
      value={value}
      onChange={onChange}
    />
  )
}
