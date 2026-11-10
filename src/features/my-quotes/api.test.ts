import {
  confirmQuote,
  getQuoteDetail,
  getQuoteHistory,
  getRequestQuotes,
} from '@/features/my-quotes/api'
import api from '@/lib/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRequestQuotes', () => {
  it('요청 id로 받은 견적 목록을 불러온다', async () => {
    const list = { items: [] }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: list })

    await expect(getRequestQuotes('request-1')).resolves.toEqual(list)
    expect(get).toHaveBeenCalledWith('/move-requests/request-1/quotes', {
      params: {},
    })
  })
})

describe('getQuoteHistory', () => {
  it('커서를 query로 보내고 받았던 견적 목록을 반환한다', async () => {
    const page = { items: [], hasNext: false, nextCursor: null }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getQuoteHistory({ cursor: 'cursor-2' })).resolves.toEqual(page)
    expect(get).toHaveBeenCalledWith('/move-requests/history', {
      params: { cursor: 'cursor-2' },
    })
  })
})

describe('confirmQuote', () => {
  it('견적 id로 확정을 요청한다', async () => {
    const quote = { id: 'quote-1' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: quote })

    await expect(confirmQuote('quote-1')).resolves.toEqual(quote)
    expect(post).toHaveBeenCalledWith('/quotes/quote-1/confirm')
  })
})

describe('getQuoteDetail', () => {
  it('견적 id로 견적 상세를 불러온다', async () => {
    const quote = { id: 'quote-1' }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: quote })

    await expect(getQuoteDetail('quote-1')).resolves.toEqual(quote)
    expect(get).toHaveBeenCalledWith('/quotes/quote-1')
  })
})
