import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getRejectedRequests,
  rejectRequest,
  sendQuote,
} from '@/features/received-requests/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sendQuote', () => {
  it('요청 id 경로로 견적가를 보내고 보낸 견적을 반환한다', async () => {
    const sentQuote = { id: 'quote-1', price: 250000 }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: sentQuote })

    await expect(sendQuote('request-1', { price: 250000 })).resolves.toEqual(
      sentQuote,
    )
    expect(post).toHaveBeenCalledWith('/move-requests/request-1/quotes', {
      price: 250000,
    })
  })
})

describe('rejectRequest', () => {
  it('요청 id 경로로 반려하고 반려한 요청을 반환한다', async () => {
    const rejected = { rejectedAt: '2026-10-30T09:00:00.000Z' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: rejected })

    await expect(rejectRequest('request-1')).resolves.toEqual(rejected)
    expect(post).toHaveBeenCalledWith('/move-requests/request-1/rejections')
  })
})

describe('getRejectedRequests', () => {
  it('커서를 query로 보내고 반려한 요청 목록을 반환한다', async () => {
    const page = { items: [], hasNext: false, nextCursor: null }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getRejectedRequests({ cursor: 'cursor-2' })).resolves.toEqual(
      page,
    )
    expect(get).toHaveBeenCalledWith('/movers/me/rejected-requests', {
      params: { cursor: 'cursor-2' },
    })
  })
})
