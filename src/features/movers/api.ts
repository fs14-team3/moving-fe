import api from '@/lib/api'
import type {
  FavoriteMoverListParams,
  MoverListParams,
  MoverListResponse,
} from './types'

export async function getMovers(params?: MoverListParams) {
  const { data } = await api.get<MoverListResponse>('/movers', {
    params,
  })

  return data
}

export async function getFavoriteMovers(params?: FavoriteMoverListParams) {
  const { data } = await api.get<MoverListResponse>('/customers/me/favorites', {
    params,
  })

  return data
}
