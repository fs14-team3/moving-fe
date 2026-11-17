import { skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getMoveEstimate } from '../api'
import type { MoveEstimateQuery } from '../types'

// 입력이 모두 채워졌을 때만 예상 비용을 조회한다. (query가 null이면 조회하지 않음)
// 예상 비용은 참고용이라 실패하면 다시 시도하지 않고 카드를 숨긴다.
export function useMoveEstimate(query: MoveEstimateQuery | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.moveEstimates.detail(query),
    queryFn: query ? ({ signal }) => getMoveEstimate(query, signal) : skipToken,
    retry: false,
  })

  return { estimate: data, isLoading }
}
