import api from '@/lib/api'
import type {
  FavoriteMoverListParams,
  MoverDetail,
  MoverId,
  MoverListParams,
  MoverListResponse,
  MoverReviewListParams,
  MoverReviewListResponse,
} from './types'

export async function getMovers(params?: MoverListParams) {
  const { data } = await api.get<MoverListResponse>('/movers', {
    params,
  })

  return data
}

export async function getMover(moverId: MoverId) {
  const { data } = await api.get<MoverDetail>(`/movers/${moverId}`)

  return data
}

export async function getFavoriteMovers(params?: FavoriteMoverListParams) {
  const { data } = await api.get<MoverListResponse>('/customers/me/favorites', {
    params,
  })

  return data
}

export async function getMoverReviews(
  moverId: MoverId,
  params?: MoverReviewListParams,
) {
  const { data } = await api.get<MoverReviewListResponse>(
    `/movers/${moverId}/reviews`,
    { params },
  )

  return data
}
