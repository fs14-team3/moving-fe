import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { removeFavorite } from '@/features/favorites/api'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/favorites/api', () => ({
  removeFavorite: vi.fn(),
}))

function renderUseRemoveFavorite() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useRemoveFavorite('mover-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useRemoveFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('찜 해제에 성공하면 관련 데이터를 다시 불러온다', async () => {
    vi.mocked(removeFavorite).mockResolvedValue({
      moverId: 'mover-1',
      isFavorite: false,
      favoriteCount: 0,
    })

    const { result, invalidateQueries } = renderUseRemoveFavorite()

    act(() => result.current.mutate())

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.favorites.all,
      }),
    )

    expect(removeFavorite).toHaveBeenCalledWith('mover-1')

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.movers.lists(),
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.movers.detail('mover-1'),
    })
  })

  it('찜 해제에 실패하면 오류 토스트를 표시한다', async () => {
    vi.mocked(removeFavorite).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseRemoveFavorite()

    act(() => result.current.mutate())

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.favorite.updateFailed,
      ),
    )
  })

  it('인증 오류는 별도의 오류 토스트를 표시하지 않는다', async () => {
    vi.mocked(removeFavorite).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )

    const { result } = renderUseRemoveFavorite()

    act(() => result.current.mutate())

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).not.toHaveBeenCalled()
  })
})
