import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReviewSection from '@/components/mover/review/ReviewSection'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { MOCK_REVIEWS } from '@/features/movers/fixtures/reviews'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'

vi.mock('@/features/movers/hooks/useMoverReviews', () => ({
  useMoverReviews: vi.fn(),
}))

function createReviewsResult(
  overrides: Partial<ReturnType<typeof useMoverReviews>> = {},
) {
  return {
    reviews: MOCK_REVIEWS.slice(0, 5),
    totalCount: 6,
    totalPages: 2,
    isPending: false,
    isFetching: false,
    isError: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('ReviewSection', () => {
  const mover = MOCK_MOVER_DETAILS[0]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMoverReviews).mockReturnValue(createReviewsResult())
  })

  it('리뷰를 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useMoverReviews).mockReturnValue(
      createReviewsResult({ reviews: [], isPending: true }),
    )

    render(<ReviewSection mover={mover} />)

    expect(screen.getByText('리뷰를 불러오고 있습니다.')).toBeInTheDocument()
  })

  it('리뷰가 없으면 빈 상태를 보여 준다', () => {
    vi.mocked(useMoverReviews).mockReturnValue(
      createReviewsResult({ reviews: [], totalCount: 0, totalPages: 0 }),
    )

    render(<ReviewSection mover={mover} />)

    expect(screen.getByText('아직 등록된 리뷰가 없어요!')).toBeInTheDocument()
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMoverReviews).mockReturnValue(
      createReviewsResult({ reviews: [], isError: true, refetch }),
    )
    const user = userEvent.setup()

    render(<ReviewSection mover={mover} />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('페이지를 선택하면 해당 페이지의 리뷰를 조회한다', async () => {
    const user = userEvent.setup()
    render(<ReviewSection mover={mover} />)

    await user.click(screen.getByRole('button', { name: '2' }))

    expect(useMoverReviews).toHaveBeenLastCalledWith(mover.id, {
      page: 2,
      pageSize: 5,
    })
  })
})
