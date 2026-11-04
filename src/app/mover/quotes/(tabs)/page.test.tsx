import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SentQuotesPage from '@/app/mover/quotes/(tabs)/page'
import { getSentQuotes, type SentQuote } from '@/features/sent-quotes/api'

vi.mock('@/features/sent-quotes/api', () => ({
  getSentQuotes: vi.fn(),
}))

const mockGetSentQuotes = vi.mocked(getSentQuotes)

function createSentQuote(
  id: string,
  customerName: string,
  overrides: {
    status?: SentQuote['status']
    moveRequestStatus?: SentQuote['moveRequest']['status']
    moveDate?: string
  } = {},
): SentQuote {
  return {
    id,
    price: 180000,
    status: overrides.status ?? 'SUBMITTED',
    isDesignated: true,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName,
      moveType: 'SMALL',
      moveDate: overrides.moveDate ?? '2026-11-20',
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: overrides.moveRequestStatus ?? 'PENDING',
      isDesignated: true,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
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
      <SentQuotesPage />
    </QueryClientProvider>,
  )
}

async function findCard(customerName: string) {
  const heading = await screen.findByRole('heading', {
    name: `${customerName} 고객님`,
  })
  return heading.closest('a')!
}

describe('SentQuotesPage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
    // 이사 완료 여부가 오늘 날짜에 따라 달라져서 한국 시간 2026-11-04 정오로 고정한다.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-04T03:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    mockGetSentQuotes.mockReset()
  })

  it('보낸 견적을 카드로 보여 주고, 누르면 견적 상세로 이동한다', async () => {
    mockGetSentQuotes.mockResolvedValue({
      items: [createSentQuote('quote-1', '김코드')],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    const card = await findCard('김코드')
    expect(card).toHaveAttribute('href', '/mover/quotes/quote-1')
    expect(within(card).getByText('소형이사')).toBeInTheDocument()
    expect(within(card).getByText('지정 견적 요청')).toBeInTheDocument()
    expect(within(card).getByText('서울특별시 중구')).toBeInTheDocument()
    expect(within(card).getByText('경기도 수원시')).toBeInTheDocument()
    expect(within(card).getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(within(card).getByText('180,000원')).toBeInTheDocument()
    expect(within(card).queryByText('확정견적')).toBeNull()
    expect(within(card).queryByText('이사 완료된 견적이에요')).toBeNull()
  })

  it('확정된 견적에는 확정견적 라벨을, 이사가 끝난 견적에는 이사 완료 안내를 보여 준다', async () => {
    mockGetSentQuotes.mockResolvedValue({
      items: [
        createSentQuote('quote-1', '김코드', { status: 'CONFIRMED' }),
        createSentQuote('quote-2', '이코드', {
          status: 'CONFIRMED',
          moveRequestStatus: 'COMPLETED',
        }),
        createSentQuote('quote-3', '박코드', {
          status: 'NOT_SELECTED',
          moveRequestStatus: 'COMPLETED',
        }),
        // BE가 아직 COMPLETED로 바꾸지 않았어도 확정된 요청의 이사일이 지났으면 이사 완료로 본다.
        createSentQuote('quote-4', '최코드', {
          status: 'CONFIRMED',
          moveRequestStatus: 'CONFIRMED',
          moveDate: '2026-11-03',
        }),
      ],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    const confirmed = await findCard('김코드')
    expect(within(confirmed).getByText('확정견적')).toBeInTheDocument()
    expect(within(confirmed).queryByText('이사 완료된 견적이에요')).toBeNull()

    const completed = await findCard('이코드')
    expect(within(completed).getByText('확정견적')).toBeInTheDocument()
    expect(
      within(completed).getByText('이사 완료된 견적이에요'),
    ).toBeInTheDocument()
    expect(within(completed).getByText('견적 상세보기')).toBeInTheDocument()

    const notSelected = await findCard('박코드')
    expect(within(notSelected).queryByText('확정견적')).toBeNull()
    expect(
      within(notSelected).getByText('이사 완료된 견적이에요'),
    ).toBeInTheDocument()

    const pastMoveDate = await findCard('최코드')
    expect(
      within(pastMoveDate).getByText('이사 완료된 견적이에요'),
    ).toBeInTheDocument()
  })

  it('목록 끝에 닿으면 다음 페이지를 이어서 불러온다', async () => {
    mockGetSentQuotes
      .mockResolvedValueOnce({
        items: [createSentQuote('quote-1', '김코드')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createSentQuote('quote-2', '이코드')],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(await findCard('이코드')).toBeInTheDocument()
    expect(mockGetSentQuotes).toHaveBeenLastCalledWith({ cursor: 'cursor-2' })
    expect(
      screen.getByRole('heading', { name: '김코드 고객님' }),
    ).toBeInTheDocument()
  })

  it('보낸 견적이 없으면 빈 목록 안내를 보여 준다', async () => {
    mockGetSentQuotes.mockResolvedValue({
      items: [],
      hasNext: false,
      nextCursor: null,
    })

    renderPage()

    expect(
      await screen.findByText('아직 보낸 견적이 없어요'),
    ).toBeInTheDocument()
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetSentQuotes
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce({
        items: [createSentQuote('quote-1', '김코드')],
        hasNext: false,
        nextCursor: null,
      })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '보낸 견적을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await findCard('김코드')).toBeInTheDocument()
  })
})
