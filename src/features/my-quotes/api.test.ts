import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmQuote, getRequestQuotes } from '@/features/my-quotes/api'
import api from '@/lib/api'

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

describe('confirmQuote', () => {
  it('견적 id로 확정을 요청한다', async () => {
    const quote = { id: 'quote-1' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: quote })

    await expect(confirmQuote('quote-1')).resolves.toEqual(quote)
    expect(post).toHaveBeenCalledWith('/quotes/quote-1/confirm')
  })
})
