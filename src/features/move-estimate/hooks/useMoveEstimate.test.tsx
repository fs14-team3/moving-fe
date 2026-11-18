import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMoveEstimate } from '@/features/move-estimate/api'
import { useMoveEstimate } from '@/features/move-estimate/hooks/useMoveEstimate'
import type { MoveEstimateQuery } from '@/features/move-estimate/types'

vi.mock('@/features/move-estimate/api', () => ({
  getMoveEstimate: vi.fn(),
}))

const QUERY: MoveEstimateQuery = {
  moveType: 'HOME',
  moveDate: '2026-12-05',
  from: '서울 중구 세종대로 110',
  to: '서울 강남구 테헤란로 152',
}

const ESTIMATE = {
  distanceKm: 12.3,
  minPrice: 710_000,
  maxPrice: 950_000,
  surcharges: [],
}

function renderUseMoveEstimate(query: MoveEstimateQuery | null) {
  // 훅에서 retry를 끄는지 확인하려고 기본 retry는 그대로 둔다.
  const queryClient = new QueryClient()

  return renderHook(() => useMoveEstimate(query), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMoveEstimate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('입력이 다 채워지지 않으면 조회하지 않는다', () => {
    const { result } = renderUseMoveEstimate(null)

    expect(getMoveEstimate).not.toHaveBeenCalled()
    expect(result.current).toEqual({ estimate: undefined, isLoading: false })
  })

  it('입력이 다 채워지면 예상 비용을 조회한다', async () => {
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
    const { result } = renderUseMoveEstimate(QUERY)

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.estimate).toEqual(ESTIMATE))
    expect(result.current.isLoading).toBe(false)
    expect(getMoveEstimate).toHaveBeenCalledWith(QUERY, expect.any(AbortSignal))
  })

  it('조회에 실패하면 다시 시도하지 않고 예상 비용을 비운다', async () => {
    vi.mocked(getMoveEstimate).mockRejectedValue(new Error('Network Error'))
    const { result } = renderUseMoveEstimate(QUERY)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.estimate).toBeUndefined()
    expect(getMoveEstimate).toHaveBeenCalledOnce()
  })
})
