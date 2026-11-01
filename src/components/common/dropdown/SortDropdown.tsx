import { MOVER_SORT_OPTIONS, type MoverSort } from '@/constants/moverSort'
import Dropdown from './Dropdown'

type SortDropdownProps = {
  value?: MoverSort
  onChange?: (value: MoverSort) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Dropdown
      placeholder="정렬"
      options={MOVER_SORT_OPTIONS}
      variant="sort"
      value={value}
      onChange={(nextValue) => onChange?.(nextValue as MoverSort)}
    />
  )
}
