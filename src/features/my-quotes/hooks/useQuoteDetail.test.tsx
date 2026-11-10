import { getQuoteDetail } from '@/features/my-quotes/api'
import { MOCK_QUOTE_DETAIL } from '@/features/my-quotes/fixtures/quotes'
import { useQuoteDetail } from '@/features/my-quotes/hooks/useQuoteDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/my-quotes/api', () => ({ getQuoteDetail: vi.fn() }))

function renderUseQuoteDetail(quoteId = 'quote-1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useQuoteDetail(quoteId), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useQuoteDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('견적 상세 정보를 반환한다', async () => {
    vi.mocked(getQuoteDetail).mockResolvedValue(MOCK_QUOTE_DETAIL)

    const { result } = renderUseQuoteDetail(MOCK_QUOTE_DETAIL.id)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getQuoteDetail).toHaveBeenCalledWith(MOCK_QUOTE_DETAIL.id)
    expect(result.current.quote).toEqual(MOCK_QUOTE_DETAIL)
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getQuoteDetail).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseQuoteDetail()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.quote).toBeUndefined()
  })
})
