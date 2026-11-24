import type { components } from '@/lib/api-schema'
import type { Option } from '@/lib/options'

type ReviewSummaryAspectKey =
  components['schemas']['ReviewSummaryAspect']['key']

export const REVIEW_ASPECT_OPTIONS: Option<ReviewSummaryAspectKey>[] = [
  { value: 'PUNCTUALITY', label: '시간 약속' },
  { value: 'HANDLING', label: '짐 취급' },
  { value: 'SPEED', label: '속도' },
  { value: 'COMMUNICATION', label: '소통' },
  { value: 'PRICE', label: '가격' },
]
