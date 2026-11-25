import type { MoveProgressStep } from '@/features/move-progress/api'
import type { Option } from '@/lib/options'

export const MOVE_PROGRESS_STEPS: Option<MoveProgressStep>[] = [
  { value: 'DEPARTED', label: '출발' },
  { value: 'LOADING', label: '상차' },
  { value: 'IN_TRANSIT', label: '운행' },
  { value: 'UNLOADING', label: '하차' },
  { value: 'COMPLETED', label: '완료' },
]
