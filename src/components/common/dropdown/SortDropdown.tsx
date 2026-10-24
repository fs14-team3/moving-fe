import Dropdown from './Dropdown'

export default function SortDropdown() {
  const sorts = [
    { label: '리뷰 많은순', value: 'review' },
    { label: '평점 높은순', value: 'rating' },
    { label: '경력 높은순', value: 'career' },
    { label: '확정 많은순', value: 'confirmed' },
  ]

  return <Dropdown placeholder="정렬" options={sorts} variant="sort" />
}
