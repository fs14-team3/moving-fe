import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getMoveProgress,
  type MoveProgress,
} from '@/features/move-progress/api'
import { useMoveProgress } from '@/features/move-progress/hooks/useMoveProgress'

vi.mock('@/features/move-progress/api', () => ({ getMoveProgress: vi.fn() }))

const MINUTE = 60 * 1000

const IN_PROGRESS: MoveProgress = {
  steps: [{ step: 'DEPARTED', recordedAt: '2026-11-23T00:10:00.000Z' }],
  nextStep: 'LOADING',
  canRecord: false,
}

const COMPLETED: MoveProgress = {
  steps: ['DEPARTED', 'LOADING', 'IN_TRANSIT', 'UNLOADING', 'COMPLETED'].map(
    (step) => ({
      step: step as MoveProgress['steps'][number]['step'],
      recordedAt: '2026-11-23T00:10:00.000Z',
    }),
  ),
  nextStep: null,
  canRecord: false,
}

async function renderUseMoveProgress(poll: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const { result } = renderHook(() => useMoveProgress('quote-1', poll), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  await waitFor(() => expect(result.current.isPending).toBe(false))
  return result
}

describe('useMoveProgress', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('이사 당일에는 1분마다 진행 상황을 다시 불러온다', async () => {
    vi.mocked(getMoveProgress).mockResolvedValue(IN_PROGRESS)
    const result = await renderUseMoveProgress(true)

    expect(result.current.progress).toEqual(IN_PROGRESS)
    expect(getMoveProgress).toHaveBeenCalledWith('quote-1')
    await vi.advanceTimersByTimeAsync(MINUTE)
    expect(getMoveProgress).toHaveBeenCalledTimes(2)
  })

  it('완료까지 기록되면 다시 불러오지 않는다', async () => {
    vi.mocked(getMoveProgress).mockResolvedValue(COMPLETED)
    await renderUseMoveProgress(true)

    await vi.advanceTimersByTimeAsync(5 * MINUTE)
    expect(getMoveProgress).toHaveBeenCalledTimes(1)
  })

  it('이사 당일이 아니면 다시 불러오지 않는다', async () => {
    vi.mocked(getMoveProgress).mockResolvedValue(IN_PROGRESS)
    await renderUseMoveProgress(false)

    await vi.advanceTimersByTimeAsync(5 * MINUTE)
    expect(getMoveProgress).toHaveBeenCalledTimes(1)
  })
})
