import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendQuote } from '@/features/received-requests/api'
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
