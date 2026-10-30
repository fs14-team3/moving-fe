import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReceivedRequestsPage from '@/app/mover/requests/page'
import {
  getReceivedRequests,
  type ReceivedRequest,
} from '@/features/received-requests/api'

vi.mock('@/features/received-requests/api', () => ({
  getReceivedRequests: vi.fn(),
}))

const mockGetReceivedRequests = vi.mocked(getReceivedRequests)

function createRequest(id: string, customerName: string): ReceivedRequest {
  return {
    id,
    customerName,
    moveType: 'HOME',
    moveDate: '2026-11-20',
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    status: 'PENDING',
    isDesignated: false,
    createdAt: '2026-10-30T09:00:00.000Z',
  }
}

// jsdom에는 IntersectionObserver가 없다. 목록 끝 요소가 계속 화면에 보이는 상황을 흉내 낸다.
class VisibleIntersectionObserver {
  private callback: IntersectionObserverCallback
  private disconnected = false

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe() {
    setTimeout(() => {
      if (this.disconnected) return
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    })
  }

  disconnect() {
    this.disconnected = true
  }

  unobserve() {}

  takeRecords() {
    return []
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <ReceivedRequestsPage />
    </QueryClientProvider>,
  )
}

describe('ReceivedRequestsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockGetReceivedRequests.mockReset()
  })

  it('다음 페이지를 불러오지 못하면 다시 요청하지 않고, 다시 시도를 누르면 이어서 불러온다', async () => {
    const user = userEvent.setup()
    // 실제 요청처럼 조금 뒤에 실패해야 화면이 '불러오는 중'을 거친다.
    mockGetReceivedRequests
      .mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('서버 오류')), 10),
          ),
      )
      .mockResolvedValueOnce({
        items: [createRequest('1', '김코드')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '요청을 더 불러오지 못했습니다.',
    )
    expect(
      screen.getByRole('heading', { name: '김코드 고객님' }),
    ).toBeInTheDocument()
    // 목록 끝 요소가 계속 보여도 실패한 다음 페이지를 저절로 다시 부르지 않는다.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(mockGetReceivedRequests).toHaveBeenCalledTimes(2)

    mockGetReceivedRequests.mockResolvedValueOnce({
      items: [createRequest('2', '이코드')],
      hasNext: false,
      nextCursor: null,
    })
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByRole('heading', { name: '이코드 고객님' }),
    ).toBeInTheDocument()
    expect(mockGetReceivedRequests).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-2' }),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
