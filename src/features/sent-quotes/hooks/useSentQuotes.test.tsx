import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSentQuotes, type SentQuote } from '@/features/sent-quotes/api'
import { useSentQuotes } from '@/features/sent-quotes/hooks/useSentQuotes'

vi.mock('@/features/sent-quotes/api', () => ({
  getSentQuotes: vi.fn(),
}))

function createSentQuote(id: string): SentQuote {
  return {
    id,
    price: 180000,
    status: 'SUBMITTED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName: '김코드',
      moveType: 'SMALL',
      moveDate: '2026-11-20',
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'PENDING',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

function renderUseSentQuotes() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useSentQuotes(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useSentQuotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('첫 페이지를 불러오고, 다음 페이지는 커서로 이어 붙인다', async () => {
    vi.mocked(getSentQuotes)
      .mockResolvedValueOnce({
        items: [createSentQuote('1')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createSentQuote('2')],
        hasNext: false,
        nextCursor: null,
      })

    const { result } = renderUseSentQuotes()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getSentQuotes).toHaveBeenCalledWith({ cursor: undefined })
    expect(result.current.hasNextPage).toBe(true)

    act(() => {
      void result.current.fetchNextPage()
    })

    await waitFor(() =>
      expect(result.current.sentQuotes.map(({ id }) => id)).toEqual(['1', '2']),
    )
    expect(getSentQuotes).toHaveBeenLastCalledWith({ cursor: 'cursor-2' })
    expect(result.current.hasNextPage).toBe(false)
  })

  it('조회에 실패하면 빈 목록과 오류 상태를 반환한다', async () => {
    vi.mocked(getSentQuotes).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseSentQuotes()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.sentQuotes).toEqual([])
    expect(result.current.hasData).toBe(false)
  })
})
