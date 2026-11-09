import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createReview,
  getMyReviews,
  getWritableReviews,
} from '@/features/reviews/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getWritableReviews', () => {
  it('페이지를 query로 보내고 작성 가능한 리뷰 목록을 반환한다', async () => {
    const page = {
      items: [],
      page: 2,
      pageSize: 4,
      totalCount: 0,
      totalPages: 0,
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getWritableReviews({ page: 2, pageSize: 4 })).resolves.toEqual(
      page,
    )
    expect(get).toHaveBeenCalledWith('/customers/me/reviews/writable', {
      params: { page: 2, pageSize: 4 },
    })
  })
})

describe('getMyReviews', () => {
  it('페이지를 query로 보내고 내가 쓴 리뷰 목록을 반환한다', async () => {
    const page = {
      items: [],
      page: 1,
      pageSize: 6,
      totalCount: 0,
      totalPages: 0,
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getMyReviews({ page: 1, pageSize: 6 })).resolves.toEqual(page)
    expect(get).toHaveBeenCalledWith('/customers/me/reviews', {
      params: { page: 1, pageSize: 6 },
    })
  })
})

describe('createReview', () => {
  it('견적 id · 평점 · 후기를 보낸다', async () => {
    const body = {
      quoteId: 'quote-1',
      rating: 5,
      content: '친절하고 꼼꼼하셨어요',
    }
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue({ data: { id: 'r-1' } })

    await expect(createReview(body)).resolves.toEqual({ id: 'r-1' })
    expect(post).toHaveBeenCalledWith('/reviews', body)
  })
})
