import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuoteHistoryPage from '@/app/my-quotes/(tabs)/history/page'
import { MOCK_MOVE_REQUEST } from '@/features/move-request/fixtures/moveRequests'
import {
  getQuoteHistory,
  type CustomerQuote,
  type QuoteHistoryItem,
} from '@/features/my-quotes/api'

vi.mock('@/features/my-quotes/api', () => ({
  getQuoteHistory: vi.fn(),
}))

const mockGetQuoteHistory = vi.mocked(getQuoteHistory)

function createQuote(
  id: string,
  nickname: string,
  status: CustomerQuote['status'] = 'NOT_SELECTED',
): CustomerQuote {
  return {
    id,
    price: 180000,
    status,
    isDesignated: true,
    createdAt: '2026-11-05T09:00:00.000Z',
    mover: {
      id: `mover-${id}`,
      nickname,
      imageUrl: null,
      intro: `${nickname} 기사님 소개`,
      description: null,
      careerYears: 7,
      serviceTypes: ['OFFICE'],
      averageRating: 5,
      reviewCount: 178,
      confirmedCount: 334,
      isFavorite: false,
      favoriteCount: 136,
    },
  }
}

function createRequest(id: string, quotes: CustomerQuote[]): QuoteHistoryItem {
  return {
    ...MOCK_MOVE_REQUEST,
    id,
    moveType: 'OFFICE',
    status: 'COMPLETED',
    quoteCount: quotes.length,
    quotes,
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
      <QuoteHistoryPage />
    </QueryClientProvider>,
  )
}

describe('QuoteHistoryPage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockGetQuoteHistory.mockReset()
  })

  it('지난 요청의 견적 정보와 받은 견적을 함께 보여 준다', async () => {
    mockGetQuoteHistory.mockResolvedValue({
      items: [
        createRequest('request-1', [
          createQuote('quote-1', '김코드', 'CONFIRMED'),
          createQuote('quote-2', '이코드'),
        ]),
      ],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    const card = (
      await screen.findByRole('heading', { name: '견적 정보' })
    ).closest('article')!
    // 2026-11-04T12:00Z는 한국 시간으로 11월 4일 밤 9시다.
    expect(within(card).getAllByText('26. 11. 04.')).not.toHaveLength(0)
    expect(
      within(card).getByText('서울특별시 중구 세종대로 110'),
    ).toBeInTheDocument()
    expect(
      within(card).getByText('부산광역시 해운대구 해운대로 1'),
    ).toBeInTheDocument()
    expect(within(card).getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { name: '견적서 목록 2' }),
    ).toBeInTheDocument()

    const confirmed = within(card).getByText('김코드 기사님 소개').closest('a')!
    expect(confirmed).toHaveAttribute('href', '/my-quotes/quote-1')
    expect(within(confirmed).getAllByText('확정견적')).not.toHaveLength(0)
    expect(within(confirmed).getByText('180,000원')).toBeInTheDocument()

    const notSelected = within(card)
      .getByText('이코드 기사님 소개')
      .closest('a')!
    expect(within(notSelected).getAllByText('견적대기')).not.toHaveLength(0)
  })

  it('확정견적을 고르면 그 요청의 확정한 견적만 보여 준다', async () => {
    const user = userEvent.setup()
    mockGetQuoteHistory.mockResolvedValue({
      items: [
        createRequest('request-1', [
          createQuote('quote-1', '김코드', 'CONFIRMED'),
          createQuote('quote-2', '이코드'),
        ]),
        createRequest('request-2', [createQuote('quote-3', '박코드')]),
      ],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    const [first, second] = (
      await screen.findAllByRole('heading', { name: '견적 정보' })
    ).map((heading) => heading.closest('article')!)

    await user.click(within(first).getByRole('button', { name: '전체' }))
    await user.click(within(first).getByRole('button', { name: '확정견적' }))

    expect(within(first).getByText('김코드 기사님 소개')).toBeInTheDocument()
    expect(within(first).queryByText('이코드 기사님 소개')).toBeNull()
    expect(
      within(first).getByRole('heading', { name: '견적서 목록 1' }),
    ).toBeInTheDocument()
    // 다른 요청의 필터는 그대로다.
    expect(within(second).getByText('박코드 기사님 소개')).toBeInTheDocument()

    await user.click(within(second).getByRole('button', { name: '전체' }))
    await user.click(within(second).getByRole('button', { name: '확정견적' }))

    expect(within(second).getByText('확정한 견적이 없어요')).toBeInTheDocument()
  })

  it('목록 끝에 닿으면 다음 페이지를 이어서 불러온다', async () => {
    mockGetQuoteHistory
      .mockResolvedValueOnce({
        items: [createRequest('request-1', [createQuote('quote-1', '김코드')])],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createRequest('request-2', [createQuote('quote-2', '이코드')])],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(await screen.findByText('이코드 기사님 소개')).toBeInTheDocument()
    expect(mockGetQuoteHistory).toHaveBeenLastCalledWith({
      cursor: 'cursor-2',
    })
    expect(screen.getByText('김코드 기사님 소개')).toBeInTheDocument()
  })

  it('받았던 견적이 없으면 빈 목록 안내를 보여 준다', async () => {
    mockGetQuoteHistory.mockResolvedValue({
      items: [],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    expect(
      await screen.findByText('아직 받았던 견적이 없어요'),
    ).toBeInTheDocument()
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetQuoteHistory
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce({
        items: [createRequest('request-1', [createQuote('quote-1', '김코드')])],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '받았던 견적을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('김코드 기사님 소개')).toBeInTheDocument()
  })
})
