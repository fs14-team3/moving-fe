import { compareQuotes } from '@/features/quotes-compare/api'
import type { QuoteComparisonRequest } from '@/features/quotes-compare/types'
import api from '@/lib/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
})

describe('compareQuotes', () => {
  it('선택한 견적과 키워드로 비교를 요청한다', async () => {
    const result = { quotes: [], recommendation: { quoteIds: [], reason: '' } }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: result })
    const body: QuoteComparisonRequest = {
      quoteIds: ['quote-1', 'quote-2'],
      keywords: ['PRICE'],
    }

    await expect(compareQuotes('request-1', body)).resolves.toEqual(result)
    expect(post).toHaveBeenCalledWith(
      '/move-requests/request-1/quotes/compare',
      body,
    )
  })
})
