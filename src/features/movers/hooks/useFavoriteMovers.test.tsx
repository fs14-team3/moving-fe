import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFavoriteMovers } from '@/features/movers/api'
import { useFavoriteMovers } from '@/features/movers/hooks/useFavoriteMovers'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'

vi.mock('@/features/movers/api', () => ({ getFavoriteMovers: vi.fn() }))

function renderUseFavoriteMovers(enabled = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useFavoriteMovers({ limit: 3 }, { enabled }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useFavoriteMovers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('활성화하면 지정한 개수만큼 찜한 기사님을 조회한다', async () => {
    vi.mocked(getFavoriteMovers).mockResolvedValue({
      items: MOCK_MOVERS.slice(0, 3),
      nextCursor: null,
      hasNext: false,
    })
    const { result } = renderUseFavoriteMovers()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getFavoriteMovers).toHaveBeenCalledWith({
      limit: 3,
      cursor: undefined,
    })
    expect(result.current.favoriteMovers).toEqual(MOCK_MOVERS.slice(0, 3))
  })

  it('비활성화하면 찜한 기사님을 조회하지 않는다', () => {
    renderUseFavoriteMovers(false)

    expect(getFavoriteMovers).not.toHaveBeenCalled()
  })
})
