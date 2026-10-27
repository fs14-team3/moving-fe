import type { components } from '@/lib/api-schema'

export type MoverSort = components['schemas']['MoverSort']

export const MOVER_SORT_OPTIONS: {
  value: MoverSort
  label: string
}[] = [
  { label: '리뷰 많은순', value: 'REVIEW_COUNT' },
  { label: '평점 높은순', value: 'RATING' },
  { label: '경력 높은순', value: 'CAREER' },
  { label: '확정 많은순', value: 'CONFIRMED_COUNT' },
]
