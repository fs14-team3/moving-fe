import type { components } from '@/lib/api-schema'

type ReviewSummaryAspectKey =
  components['schemas']['ReviewSummaryAspect']['key']

export const REVIEW_ASPECT_OPTIONS: {
  value: ReviewSummaryAspectKey
  label: string
}[] = [
  { value: 'PUNCTUALITY', label: '시간 약속' },
  { value: 'HANDLING', label: '짐 취급' },
  { value: 'SPEED', label: '속도' },
  { value: 'COMMUNICATION', label: '소통' },
  { value: 'PRICE', label: '가격' },
]
