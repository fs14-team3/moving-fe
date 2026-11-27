import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getConfirmedQuotes } from '@/features/schedule/api'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import type { SentQuote } from '@/features/sent-quotes/api'
import { queryKeys } from '@/lib/queryKeys'

vi.mock('@/features/schedule/api', () => ({
  PAGE_SIZE: 50,
  getConfirmedQuotes: vi.fn(),
}))

function createQuote(id: string): SentQuote {
  return {
    id,
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName: '김코드',
      moveType: 'SMALL',
      moveDate: '2026-12-01',
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

function renderUseConfirmedSchedule() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const view = renderHook(() => useConfirmedSchedule(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { ...view, queryClient }
}

describe('useConfirmedSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('불러오는 동안에는 pending이고 일정은 비어 있다', () => {
    vi.mocked(getConfirmedQuotes).mockReturnValue(new Promise(() => {}))

    const { result } = renderUseConfirmedSchedule()

    expect(result.current.isPending).toBe(true)
    expect(result.current.hasData).toBe(false)
    expect(result.current.confirmedQuotes).toEqual([])
  })

  it('확정된 견적을 불러온다', async () => {
    vi.mocked(getConfirmedQuotes).mockResolvedValue([
      createQuote('1'),
      createQuote('2'),
    ])

    const { result } = renderUseConfirmedSchedule()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.hasData).toBe(true)
    expect(result.current.confirmedQuotes.map(({ id }) => id)).toEqual([
      '1',
      '2',
    ])
  })

  it('확정된 견적이 없으면 데이터는 있고 목록만 비어 있다', async () => {
    vi.mocked(getConfirmedQuotes).mockResolvedValue([])

    const { result } = renderUseConfirmedSchedule()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.hasData).toBe(true)
    expect(result.current.confirmedQuotes).toEqual([])
  })

  it('처음 불러오지 못하면 isError이고 데이터가 없다', async () => {
    vi.mocked(getConfirmedQuotes).mockRejectedValue(new Error('network'))

    const { result } = renderUseConfirmedSchedule()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.hasData).toBe(false)
  })

  it('다시 시도하면 불러온다', async () => {
    vi.mocked(getConfirmedQuotes)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([createQuote('1')])

    const { result } = renderUseConfirmedSchedule()
    await waitFor(() => expect(result.current.isError).toBe(true))

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => expect(result.current.hasData).toBe(true))
    expect(result.current.confirmedQuotes).toHaveLength(1)
  })

  it('보낸 견적 목록을 무효화하면 다시 불러온다', async () => {
    vi.mocked(getConfirmedQuotes).mockResolvedValue([createQuote('1')])

    const { result, queryClient } = renderUseConfirmedSchedule()
    await waitFor(() => expect(result.current.hasData).toBe(true))
    expect(getConfirmedQuotes).toHaveBeenCalledTimes(1)

    // useSendQuote가 견적을 보낸 뒤 하는 무효화와 같다.
    await act(async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.sentQuotes.lists(),
      })
    })

    await waitFor(() => expect(getConfirmedQuotes).toHaveBeenCalledTimes(2))
  })
})
