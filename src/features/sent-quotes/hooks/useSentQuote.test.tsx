import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSentQuote } from '@/features/sent-quotes/api'
import { MOCK_SENT_QUOTE } from '@/features/sent-quotes/fixtures/sentQuotes'
import { useSentQuote } from '@/features/sent-quotes/hooks/useSentQuote'

vi.mock('@/features/sent-quotes/api', () => ({
  getSentQuote: vi.fn(),
}))

function renderUseSentQuote(quoteId = 'quote-1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useSentQuote(quoteId), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useSentQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('보낸 견적 하나를 반환한다', async () => {
    vi.mocked(getSentQuote).mockResolvedValue(MOCK_SENT_QUOTE)

    const { result } = renderUseSentQuote('quote-1')

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getSentQuote).toHaveBeenCalledWith('quote-1')
    expect(result.current.quote).toEqual(MOCK_SENT_QUOTE)
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getSentQuote).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseSentQuote()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.quote).toBeUndefined()
  })
})
