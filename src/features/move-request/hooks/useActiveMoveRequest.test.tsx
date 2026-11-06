import { getActiveMoveRequest } from '@/features/move-request/api'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MOCK_MOVE_REQUEST } from '../fixtures/moveRequests'

vi.mock('@/features/move-request/api', () => ({
  getActiveMoveRequest: vi.fn(),
}))

function renderUseActiveMoveRequest() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useActiveMoveRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useActiveMoveRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('활성 견적 요청을 반환한다', async () => {
    vi.mocked(getActiveMoveRequest).mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    const { result } = renderUseActiveMoveRequest()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getActiveMoveRequest).toHaveBeenCalled()
    expect(result.current.activeMoveRequest).toEqual(MOCK_MOVE_REQUEST)
  })

  it('진행 중인 요청이 없으면 null을 반환한다', async () => {
    vi.mocked(getActiveMoveRequest).mockResolvedValue({ moveRequest: null })
    const { result } = renderUseActiveMoveRequest()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getActiveMoveRequest).toHaveBeenCalled()
    expect(result.current.activeMoveRequest).toBeNull()
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getActiveMoveRequest).mockRejectedValue(
      new Error('Network Error'),
    )
    const { result } = renderUseActiveMoveRequest()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.activeMoveRequest).toBeUndefined()
  })
})
