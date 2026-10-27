import Dropdown from './Dropdown'

type SortDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const sorts = [
    { label: '리뷰 많은순', value: 'review' },
    { label: '평점 높은순', value: 'rating' },
    { label: '경력 높은순', value: 'career' },
    { label: '확정 많은순', value: 'confirmed' },
  ]

  return (
    <Dropdown
      placeholder="정렬"
      options={sorts}
      variant="sort"
      value={value}
      onChange={onChange}
    />
  )
}
