import { MOVER_SORT_OPTIONS } from '@/constants/moverSort'
import Dropdown from './Dropdown'

type SortDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Dropdown
      placeholder="정렬"
      options={MOVER_SORT_OPTIONS}
      variant="sort"
      value={value}
      onChange={onChange}
    />
  )
}
