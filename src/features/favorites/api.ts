import type { MoverId } from '@/features/movers/types'
import api from '@/lib/api'
import {
  FavoriteListResponse,
  RemoveFavoritesResponse,
  type FavoriteMoverListParams,
  type FavoriteState,
} from './types'

export async function getFavoriteMovers(params?: FavoriteMoverListParams) {
  const { data } = await api.get<FavoriteListResponse>(
    '/customers/me/favorites',
    {
      params,
    },
  )

  return data
}

export async function addFavorite(moverId: MoverId) {
  const { data } = await api.put<FavoriteState>(`/movers/${moverId}/favorite`)

  return data
}

export async function removeFavorite(moverId: MoverId) {
  const { data } = await api.delete<FavoriteState>(
    `/movers/${moverId}/favorite`,
  )

  return data
}

export async function removeFavorites(moverIds: MoverId[]) {
  const { data } = await api.delete<RemoveFavoritesResponse>(
    '/customers/me/favorites',
    {
      data: { moverIds },
    },
  )

  return data
}
