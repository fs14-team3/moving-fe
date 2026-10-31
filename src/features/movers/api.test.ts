import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getFavoriteMovers,
  getMover,
  getMoverReviews,
  getMovers,
} from '@/features/movers/api'
import {
  MOCK_MOVER_DETAILS,
  MOCK_MOVERS,
} from '@/features/movers/fixtures/movers'
import { MOCK_REVIEWS } from '@/features/movers/fixtures/reviews'
import api from '@/lib/api'

const response = {
  items: [MOCK_MOVERS[0]],
  nextCursor: 'next-cursor',
  hasNext: true,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getMovers', () => {
  it('검색·필터·정렬·페이지 조건으로 기사님 목록을 조회한다', async () => {
    const params = {
      keyword: '김무빙',
      region: '서울' as const,
      serviceType: 'HOME' as const,
      sort: 'RATING' as const,
      cursor: 'cursor-1',
      limit: 10,
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: response })

    await expect(getMovers(params)).resolves.toEqual(response)
    expect(get).toHaveBeenCalledWith('/movers', { params })
  })
})

describe('getFavoriteMovers', () => {
  it('커서와 개수로 찜한 기사님 목록을 조회한다', async () => {
    const params = { cursor: 'cursor-1', limit: 3 }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: response })

    await expect(getFavoriteMovers(params)).resolves.toEqual(response)
    expect(get).toHaveBeenCalledWith('/customers/me/favorites', { params })
  })
})

describe('getMover', () => {
  it('기사님 ID로 상세 정보를 조회한다', async () => {
    const mover = MOCK_MOVER_DETAILS[0]
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: mover })

    await expect(getMover(mover.id)).resolves.toEqual(mover)
    expect(get).toHaveBeenCalledWith(`/movers/${mover.id}`)
  })
})

describe('getMoverReviews', () => {
  it('기사님 ID와 페이지 조건으로 리뷰를 조회한다', async () => {
    const params = { page: 2, pageSize: 5 }
    const reviewResponse = {
      items: MOCK_REVIEWS,
      page: 2,
      pageSize: 5,
      totalCount: MOCK_REVIEWS.length,
      totalPages: 2,
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: reviewResponse,
    })

    await expect(getMoverReviews('1', params)).resolves.toEqual(reviewResponse)
    expect(get).toHaveBeenCalledWith('/movers/1/reviews', { params })
  })
})
