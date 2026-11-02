import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RejectedRequestsPage from '@/app/mover/quotes/rejected/page'
import {
  getRejectedRequests,
  type RejectedRequest,
} from '@/features/received-requests/api'

vi.mock('@/features/received-requests/api', () => ({
  getRejectedRequests: vi.fn(),
}))

const mockGetRejectedRequests = vi.mocked(getRejectedRequests)

function createRejected(id: string, customerName: string): RejectedRequest {
  return {
    moveRequest: {
      id,
      customerName,
      moveType: 'SMALL',
      moveDate: '2026-11-20',
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'PENDING',
      isDesignated: true,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
    rejectedAt: '2026-10-31T09:00:00.000Z',
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
      <RejectedRequestsPage />
    </QueryClientProvider>,
  )
}

describe('RejectedRequestsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockGetRejectedRequests.mockReset()
  })

  it('반려한 요청을 카드로 보여 주고, 반려 상태를 표시한다', async () => {
    mockGetRejectedRequests.mockResolvedValue({
      items: [createRejected('1', '김코드')],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    const card = (
      await screen.findByRole('heading', { name: '김코드 고객님' })
    ).closest('li')!
    expect(within(card).getByText('소형이사')).toBeInTheDocument()
    expect(within(card).getByText('지정 견적 요청')).toBeInTheDocument()
    expect(within(card).getByText('서울특별시 중구')).toBeInTheDocument()
    expect(within(card).getByText('경기도 수원시')).toBeInTheDocument()
    expect(within(card).getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(within(card).getByText('반려된 요청이에요')).toBeInTheDocument()
  })

  it('목록 끝에 닿으면 다음 페이지를 이어서 불러온다', async () => {
    mockGetRejectedRequests
      .mockResolvedValueOnce({
        items: [createRejected('1', '김코드')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createRejected('2', '이코드')],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(
      await screen.findByRole('heading', { name: '이코드 고객님' }),
    ).toBeInTheDocument()
    expect(mockGetRejectedRequests).toHaveBeenLastCalledWith({
      cursor: 'cursor-2',
    })
    expect(
      screen.getByRole('heading', { name: '김코드 고객님' }),
    ).toBeInTheDocument()
  })

  it('반려한 요청이 없으면 빈 목록 안내를 보여 준다', async () => {
    mockGetRejectedRequests.mockResolvedValue({
      items: [],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    expect(
      await screen.findByText('아직 반려한 요청이 없어요'),
    ).toBeInTheDocument()
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetRejectedRequests
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce({
        items: [createRejected('1', '김코드')],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '반려한 요청을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByRole('heading', { name: '김코드 고객님' }),
    ).toBeInTheDocument()
  })
})
