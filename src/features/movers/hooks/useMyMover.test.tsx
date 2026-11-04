import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMyMover } from '@/features/movers/api'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { useMyMover } from '@/features/movers/hooks/useMyMover'

vi.mock('@/features/movers/api', () => ({ getMyMover: vi.fn() }))

function renderUseMyMover() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMyMover(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMyMover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인한 기사님의 프로필을 반환한다', async () => {
    const mover = MOCK_MOVER_DETAILS[0]
    vi.mocked(getMyMover).mockResolvedValue(mover)

    const { result } = renderUseMyMover()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.mover).toEqual(mover)
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getMyMover).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseMyMover()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.mover).toBeUndefined()
  })
})
