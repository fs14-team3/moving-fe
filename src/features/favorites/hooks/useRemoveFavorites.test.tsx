import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { removeFavorites } from '../api'
import { useRemoveFavorites } from './useRemoveFavorites'

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/favorites/api', () => ({
  removeFavorites: vi.fn(),
}))

function renderUseRemoveFavorites() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useRemoveFavorites(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

const moverIds = ['mover-1', 'mover-2']

describe('useRemoveFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('찜 해제에 성공하면 관련 데이터를 다시 불러온다', async () => {
    vi.mocked(removeFavorites).mockResolvedValue({
      removedCount: 2,
    })

    const { result, invalidateQueries } = renderUseRemoveFavorites()

    act(() => result.current.mutate(moverIds))

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.favorites.all,
      }),
    )

    expect(removeFavorites).toHaveBeenCalledWith(moverIds)
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.movers.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.quotes.all,
    })
    moverIds.forEach((moverId) => {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.movers.detail(moverId),
      })
    })
  })

  it('짐 해제를 실패하면 오류 토스트를 표시한다', async () => {
    vi.mocked(removeFavorites).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseRemoveFavorites()

    act(() => result.current.mutate(moverIds))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.favorite.updateFailed,
      ),
    )
  })

  it('인증 오류는 별도의 오류 토스트를 표시하지 않는다', async () => {
    vi.mocked(removeFavorites).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )

    const { result } = renderUseRemoveFavorites()

    act(() => result.current.mutate(moverIds))

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).not.toHaveBeenCalled()
  })
})
