import api from '@/lib/api'
import type { MoverListParams, MoverListResponse } from './types'

export async function getMovers(params?: MoverListParams) {
  const { data } = await api.get<MoverListResponse>('/movers', {
    params,
  })

  return data
}
