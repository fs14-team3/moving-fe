import Dropdown from './Dropdown'

type RegionDropdownProps = {
  value?: string
  onChange?: (value: string) => void
}

export default function RegionDropdown({
  value,
  onChange,
}: RegionDropdownProps) {
  const regions = [
    { label: '전체', value: 'all' },
    { label: '서울', value: 'seoul' },
    { label: '부산', value: 'busan' },
    { label: '대구', value: 'daegu' },
    { label: '인천', value: 'incheon' },
    { label: '광주', value: 'gwangju' },
    { label: '대전', value: 'daejeon' },
    { label: '울산', value: 'ulsan' },
    { label: '세종', value: 'sejong' },
    { label: '경기', value: 'gyeonggi' },
    { label: '강원', value: 'gangwon' },
    { label: '충북', value: 'chungbuk' },
    { label: '충남', value: 'chungnam' },
    { label: '전북', value: 'jeonbuk' },
    { label: '전남', value: 'jeonnam' },
    { label: '경북', value: 'gyeongbuk' },
    { label: '경남', value: 'gyeongnam' },
    { label: '제주', value: 'jeju' },
  ]

  return (
    <Dropdown
      placeholder="지역"
      options={regions}
      variant="region"
      value={value}
      onChange={onChange}
    />
  )
}
