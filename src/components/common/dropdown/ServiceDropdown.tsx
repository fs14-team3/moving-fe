import Dropdown from './Dropdown'

type ServiceDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

export default function ServiceDropdown({
  value,
  onChange,
}: ServiceDropdownProps) {
  const services = [
    { label: '전체', value: 'all' },
    { label: '소형이사', value: 'small' },
    { label: '가정이사', value: 'home' },
    { label: '사무실이사', value: 'office' },
  ]

  return (
    <Dropdown
      placeholder="서비스"
      options={services}
      variant="service"
      value={value}
      onChange={onChange}
    />
  )
}
