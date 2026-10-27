import { REGION_OPTIONS } from '@/constants/regions'
import Dropdown from './Dropdown'

type RegionDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

const REGION_FILTER_OPTIONS = [
  { label: '전체', value: 'all' },
  ...REGION_OPTIONS,
]

export default function RegionDropdown({
  value,
  onChange,
}: RegionDropdownProps) {
  return (
    <Dropdown
      placeholder="지역"
      options={REGION_FILTER_OPTIONS}
      variant="region"
      value={value}
      onChange={onChange}
    />
  )
}
