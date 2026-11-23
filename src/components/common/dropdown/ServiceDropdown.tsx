import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import type { Option } from '@/lib/options'
import Dropdown from './Dropdown'

type ServiceFilterValue = ServiceType | 'all'

type ServiceDropdownProps = {
  value?: ServiceFilterValue
  onChange?: (value: ServiceFilterValue) => void
}

const SERVICE_OPTIONS: Option<ServiceFilterValue>[] = [
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
      onChange={(nextValue) => onChange?.(nextValue as ServiceFilterValue)}
    />
  )
}
