import {
  addFavorite,
  getFavoriteMovers,
  removeFavorite,
  removeFavorites,
} from '@/features/favorites/api'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'
import api from '@/lib/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

const response = {
  items: [MOCK_MOVERS[0]],
  nextCursor: 'next-cursor',
  hasNext: true,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getFavoriteMovers', () => {
  it('커서와 개수로 찜한 기사님 목록을 조회한다', async () => {
    const params = { cursor: 'cursor-1', limit: 3 }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: response })

    await expect(getFavoriteMovers(params)).resolves.toEqual(response)
    expect(get).toHaveBeenCalledWith('/customers/me/favorites', { params })
  })
})

describe('addFavorite', () => {
  it('기사님을 찜한다', async () => {
    const favoriteResponse = {
      moverId: 'mover-1',
      isFavorite: true,
      favoriteCount: 1,
    }
    const put = vi
      .spyOn(api, 'put')
      .mockResolvedValue({ data: favoriteResponse })

    await expect(addFavorite('mover-1')).resolves.toEqual(favoriteResponse)
    expect(put).toHaveBeenCalledWith('/movers/mover-1/favorite')
  })
})

describe('removeFavorite', () => {
  it('기사님 찜을 해제한다', async () => {
    const favoriteResponse = {
      moverId: 'mover-1',
      isFavorite: false,
      favoriteCount: 0,
    }
    const deleteRequest = vi
      .spyOn(api, 'delete')
      .mockResolvedValue({ data: favoriteResponse })

    await expect(removeFavorite('mover-1')).resolves.toEqual(favoriteResponse)
    expect(deleteRequest).toHaveBeenCalledWith('/movers/mover-1/favorite')
  })
})

describe('removeFavorites', () => {
  it('기사님 찜을 일괄 해제한다', async () => {
    const moverIds = ['mover-1', 'mover-2']
    const response = {
      removedCount: 2,
    }
    const deleteRequest = vi
      .spyOn(api, 'delete')
      .mockResolvedValue({ data: response })

    await expect(removeFavorites(moverIds)).resolves.toEqual(response)
    expect(deleteRequest).toHaveBeenCalledWith('/customers/me/favorites', {
      data: { moverIds },
    })
  })
})
