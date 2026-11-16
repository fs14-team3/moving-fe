import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSentQuote, getSentQuotes } from '@/features/sent-quotes/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getSentQuotes', () => {
  it('커서를 query로 보내고 보낸 견적 목록을 반환한다', async () => {
    const page = { items: [], hasNext: false, nextCursor: null }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getSentQuotes({ cursor: 'cursor-2' })).resolves.toEqual(page)
    expect(get).toHaveBeenCalledWith('/movers/me/quotes', {
      params: { cursor: 'cursor-2' },
    })
  })
})

describe('getSentQuote', () => {
  it('견적 ID로 보낸 견적 하나를 반환한다', async () => {
    const quote = { id: 'quote-1' }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: quote })

    await expect(getSentQuote('quote-1')).resolves.toEqual(quote)
    expect(get).toHaveBeenCalledWith('/movers/me/quotes/quote-1')
  })
})
