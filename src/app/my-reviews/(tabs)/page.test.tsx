import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import WritableReviewsPage from '@/app/my-reviews/(tabs)/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  createReview,
  getWritableReviews,
  type ReviewTarget,
} from '@/features/reviews/api'
import { ApiError } from '@/lib/api-error'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/reviews/api', () => ({
  getWritableReviews: vi.fn(),
  createReview: vi.fn(),
}))

const mockGetWritableReviews = vi.mocked(getWritableReviews)
const mockCreateReview = vi.mocked(createReview)

function createTarget(quoteId: string, nickname: string): ReviewTarget {
  return {
    quoteId,
    price: 180000,
    isDesignated: true,
    moveType: 'SMALL',
    moveDate: '2026-11-20',
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    mover: {
      id: `mover-${quoteId}`,
      nickname,
      imageUrl: null,
      intro: `${nickname} 기사님 소개`,
      description: null,
      careerYears: 7,
      serviceTypes: ['SMALL'],
      averageRating: 5,
      reviewCount: 178,
      confirmedCount: 334,
      favoriteCount: 136,
      isFavorite: false,
    },
  }
}

function createPage(items: ReviewTarget[], page = 1, totalPages = 1) {
  return {
    items,
    page,
    pageSize: 4,
    totalCount: items.length,
    totalPages,
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <WritableReviewsPage />
    </QueryClientProvider>,
  )
}

async function openReviewModal(nickname: string) {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', {
      name: `${nickname} 기사님 리뷰 작성하기`,
    }),
  )
  const dialog = screen.getByRole('dialog', { name: '리뷰 쓰기' })
  return { user, dialog }
}

async function fillReview(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
) {
  await user.click(within(dialog).getByText('5점'))
  await user.type(
    within(dialog).getByPlaceholderText('최소 10자 이상 입력해주세요'),
    '친절하고 꼼꼼하게 옮겨 주셨어요',
  )
  await user.click(within(dialog).getByRole('button', { name: '리뷰 등록' }))
}

describe('WritableReviewsPage', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  afterEach(() => {
    mockGetWritableReviews.mockReset()
    mockCreateReview.mockReset()
    vi.clearAllMocks()
  })

  it('리뷰를 쓸 수 있는 견적을 카드로 보여 준다', async () => {
    mockGetWritableReviews.mockResolvedValue(
      createPage([createTarget('quote-1', '김코드')]),
    )

    renderPage()

    const card = (await screen.findByText('김코드 기사님')).closest('article')!
    expect(within(card).getByText('김코드 기사님 소개')).toBeInTheDocument()
    expect(within(card).getByText('소형이사')).toBeInTheDocument()
    expect(within(card).getByText('지정 견적 요청')).toBeInTheDocument()
    expect(within(card).getByText('서울특별시 중구')).toBeInTheDocument()
    expect(within(card).getByText('경기도 수원시')).toBeInTheDocument()
    expect(within(card).getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(within(card).getByText('180,000원')).toBeInTheDocument()
    expect(mockGetWritableReviews).toHaveBeenCalledWith({
      page: 1,
      pageSize: 4,
    })
  })

  it('출발지 · 도착지가 응답에 없으면 -로 보여 준다', async () => {
    const target = {
      ...createTarget('quote-1', '김코드'),
      from: undefined,
      to: undefined,
    }
    mockGetWritableReviews.mockResolvedValue(createPage([target]))

    renderPage()

    const card = (await screen.findByText('김코드 기사님')).closest('article')!
    expect(within(card).getAllByText('-')).toHaveLength(2)
  })

  it('리뷰를 등록하면 그 견적으로 보내고 모달을 닫는다', async () => {
    mockGetWritableReviews.mockResolvedValue(
      createPage([createTarget('quote-1', '김코드')]),
    )
    mockCreateReview.mockResolvedValue(
      {} as Awaited<ReturnType<typeof createReview>>,
    )
    renderPage()

    const { user, dialog } = await openReviewModal('김코드')
    expect(within(dialog).getByText('김코드 기사님')).toBeInTheDocument()
    await fillReview(user, dialog)

    expect(mockCreateReview).toHaveBeenCalledWith({
      quoteId: 'quote-1',
      rating: 5,
      content: '친절하고 꼼꼼하게 옮겨 주셨어요',
    })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.review.createSuccess,
    )
  })

  it('이미 쓸 수 없는 견적이면 알리고 모달을 닫는다', async () => {
    mockGetWritableReviews.mockResolvedValue(
      createPage([createTarget('quote-1', '김코드')]),
    )
    mockCreateReview.mockRejectedValue(
      new ApiError('REVIEW_NOT_ALLOWED', 'Forbidden', 403),
    )
    renderPage()

    const { user, dialog } = await openReviewModal('김코드')
    await fillReview(user, dialog)

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.review.notAllowed)
  })

  it('등록에 실패하면 알리고 다시 시도할 수 있게 모달을 열어 둔다', async () => {
    mockGetWritableReviews.mockResolvedValue(
      createPage([createTarget('quote-1', '김코드')]),
    )
    mockCreateReview.mockRejectedValue(
      new ApiError('INTERNAL_ERROR', 'Server Error', 500),
    )
    renderPage()

    const { user, dialog } = await openReviewModal('김코드')
    await fillReview(user, dialog)

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.review.createFailed,
      ),
    )
    expect(
      screen.getByRole('dialog', { name: '리뷰 쓰기' }),
    ).toBeInTheDocument()
  })

  it('페이지 번호를 누르면 그 페이지를 불러온다', async () => {
    const user = userEvent.setup()
    mockGetWritableReviews
      .mockResolvedValueOnce(
        createPage([createTarget('quote-1', '김코드')], 1, 2),
      )
      .mockResolvedValueOnce(
        createPage([createTarget('quote-2', '이코드')], 2, 2),
      )

    renderPage()

    await screen.findByText('김코드 기사님')
    await user.click(screen.getByRole('button', { name: '2' }))

    expect(await screen.findByText('이코드 기사님')).toBeInTheDocument()
    expect(mockGetWritableReviews).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 4,
    })
  })

  it('페이지의 마지막 견적에 리뷰를 쓰면 이전 페이지로 옮긴다', async () => {
    const user = userEvent.setup()
    mockGetWritableReviews.mockImplementation(async (query) =>
      query?.page === 2
        ? createPage([createTarget('quote-5', '오코드')], 2, 2)
        : createPage([createTarget('quote-1', '김코드')], 1, 2),
    )
    mockCreateReview.mockResolvedValue(
      {} as Awaited<ReturnType<typeof createReview>>,
    )
    renderPage()

    await screen.findByText('김코드 기사님')
    await user.click(screen.getByRole('button', { name: '2' }))
    const { dialog } = await openReviewModal('오코드')
    await fillReview(user, dialog)

    expect(await screen.findByText('김코드 기사님')).toBeInTheDocument()
    expect(mockGetWritableReviews).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 4,
    })
  })

  it('작성 가능한 리뷰가 없으면 빈 목록 안내를 보여 준다', async () => {
    mockGetWritableReviews.mockResolvedValue(createPage([], 1, 0))

    renderPage()

    expect(
      await screen.findByText('작성 가능한 리뷰가 없어요!'),
    ).toBeInTheDocument()
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetWritableReviews
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce(createPage([createTarget('quote-1', '김코드')]))

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '작성 가능한 리뷰를 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('김코드 기사님')).toBeInTheDocument()
  })
})
