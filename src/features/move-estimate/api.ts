import api from '@/lib/api'
import type { MoveEstimate, MoveEstimateQuery } from './types'

// 주소를 찾지 못하면 422(ADDRESS_NOT_FOUND), 카카오 API를 쓸 수 없으면 503
export async function getMoveEstimate(
  query: MoveEstimateQuery,
  signal?: AbortSignal,
) {
  const { data } = await api.get<MoveEstimate>('/estimates', {
    params: query,
    signal,
  })

  return data
}
