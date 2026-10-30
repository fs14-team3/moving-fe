import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMover } from '@/features/movers/api'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { useMover } from '@/features/movers/hooks/useMover'

vi.mock('@/features/movers/api', () => ({ getMover: vi.fn() }))

function renderUseMover(moverId = '1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMover(moverId), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('기사님 상세 정보를 반환한다', async () => {
    const mover = MOCK_MOVER_DETAILS[0]
    vi.mocked(getMover).mockResolvedValue(mover)

    const { result } = renderUseMover(mover.id)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getMover).toHaveBeenCalledWith(mover.id)
    expect(result.current.mover).toEqual(mover)
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getMover).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseMover()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.mover).toBeUndefined()
  })
})
