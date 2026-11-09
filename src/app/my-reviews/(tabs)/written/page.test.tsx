import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WrittenReviewsPage from '@/app/my-reviews/(tabs)/written/page'
import { getMyReviews, type MyReview } from '@/features/reviews/api'

vi.mock('@/features/reviews/api', () => ({
  getMyReviews: vi.fn(),
}))

const mockGetMyReviews = vi.mocked(getMyReviews)

function createReview(id: string, nickname: string): MyReview {
  return {
    id,
    quoteId: `quote-${id}`,
    price: 180000,
    isDesignated: true,
    moveType: 'SMALL',
    moveDate: '2026-11-20',
    rating: 5,
    content: `${nickname} 기사님 친절하셨어요`,
    // 한국 시간으로 11월 22일 오전 8시다.
    createdAt: '2026-11-21T23:00:00.000Z',
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    mover: {
      id: `mover-${id}`,
      nickname,
      imageUrl: null,
      intro: `${nickname} 기사님 소개`,
      careerYears: 7,
      serviceTypes: ['SMALL'],
      averageRating: 5,
      reviewCount: 178,
      confirmedCount: 334,
      isFavorite: false,
    },
  }
}

function createPage(items: MyReview[], page = 1, totalPages = 1) {
  return {
    items,
    page,
    pageSize: 10,
    totalCount: items.length,
    totalPages,
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
      <WrittenReviewsPage />
    </QueryClientProvider>,
  )
}

describe('WrittenReviewsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockGetMyReviews.mockReset()
  })

  it('기사님 · 이사 정보와 내가 쓴 평점 · 후기를 보여 준다', async () => {
    mockGetMyReviews.mockResolvedValue(
      createPage([createReview('review-1', '김코드')]),
    )

    renderPage()

    const card = (await screen.findByText('김코드 기사님 소개')).closest(
      'article',
    )!
    expect(within(card).getByText('김코드 기사님')).toBeInTheDocument()
    expect(within(card).getByText('지정 견적 요청')).toBeInTheDocument()
    expect(within(card).getByText('서울특별시 중구')).toBeInTheDocument()
    expect(within(card).getByText('경기도 수원시')).toBeInTheDocument()
    expect(within(card).getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(
      within(card).getByRole('img', { name: '평점 5점 만점에 5점' }),
    ).toBeInTheDocument()
    expect(
      within(card).getByText('김코드 기사님 친절하셨어요'),
    ).toBeInTheDocument()
    expect(within(card).getByText('2026.11.22')).toBeInTheDocument()
  })

  it('출발지 · 도착지가 없으면 -로 보여 준다', async () => {
    mockGetMyReviews.mockResolvedValue(
      createPage([
        {
          ...createReview('review-1', '김코드'),
          from: undefined,
          to: undefined,
        },
      ]),
    )

    renderPage()

    const card = (await screen.findByText('김코드 기사님 소개')).closest(
      'article',
    )!
    expect(within(card).getAllByText('-')).toHaveLength(2)
  })

  it('목록 끝에 닿으면 다음 페이지를 이어서 불러온다', async () => {
    mockGetMyReviews
      .mockResolvedValueOnce(
        createPage([createReview('review-1', '김코드')], 1, 2),
      )
      .mockResolvedValueOnce(
        createPage([createReview('review-2', '이코드')], 2, 2),
      )

    renderPage()

    expect(await screen.findByText('이코드 기사님 소개')).toBeInTheDocument()
    expect(mockGetMyReviews).toHaveBeenLastCalledWith({ page: 2, pageSize: 10 })
    expect(mockGetMyReviews).toHaveBeenCalledTimes(2)
    expect(screen.getByText('김코드 기사님 소개')).toBeInTheDocument()
  })

  it('작성한 리뷰가 없으면 리뷰 작성하러 가기를 보여 준다', async () => {
    mockGetMyReviews.mockResolvedValue(createPage([], 1, 0))

    renderPage()

    expect(
      await screen.findByText('아직 등록된 리뷰가 없어요!'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '리뷰 작성하러 가기' }),
    ).toHaveAttribute('href', '/my-reviews')
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetMyReviews
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce(createPage([createReview('review-1', '김코드')]))

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '내가 작성한 리뷰를 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('김코드 기사님 소개')).toBeInTheDocument()
  })
})
