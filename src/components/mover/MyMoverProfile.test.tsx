import MyMoverProfile from '@/components/mover/MyMoverProfile'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { MOCK_REVIEWS } from '@/features/movers/fixtures/reviews'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'
import { useMyMover } from '@/features/movers/hooks/useMyMover'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/features/movers/hooks/useMyMover', () => ({
  useMyMover: vi.fn(),
}))

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

function createMyMoverResult(
  overrides: Partial<ReturnType<typeof useMyMover>> = {},
) {
  return {
    mover: MOCK_MOVER_DETAILS[0],
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('MyMoverProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMyMover).mockReturnValue(createMyMoverResult())
    vi.mocked(useMoverReviews).mockReturnValue(createReviewsResult())
  })

  it('내가 받은 리뷰와 평점을 보여 준다', () => {
    const mover = MOCK_MOVER_DETAILS[0]
    render(<MyMoverProfile />)

    expect(useMoverReviews).toHaveBeenCalledWith(mover.id, {
      page: 1,
      pageSize: 5,
    })
    const reviewSection = screen
      .getByRole('heading', { name: '리뷰' })
      .closest('section')!
    expect(
      within(reviewSection).getByText(mover.averageRating.toFixed(1)),
    ).toBeInTheDocument()
    expect(within(reviewSection).getByText('6개의 리뷰')).toBeInTheDocument()
  })

  it('받은 리뷰가 없으면 안내 문구 없이 리뷰 칸을 비워 둔다', () => {
    vi.mocked(useMoverReviews).mockReturnValue(
      createReviewsResult({ reviews: [], totalCount: 0, totalPages: 0 }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByRole('heading', { name: '리뷰' })).toBeInTheDocument()
    expect(screen.queryByText('아직 등록된 리뷰가 없어요!')).toBeNull()
  })

  it('내 프로필과 수정 페이지 링크를 보여 준다', () => {
    render(<MyMoverProfile />)

    expect(screen.getByRole('heading', { name: '김무빙' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '내 프로필 수정' }),
    ).toHaveAttribute('href', '/mover/profile/edit')
    expect(screen.getByRole('link', { name: '기본정보 수정' })).toHaveAttribute(
      'href',
      '/mover/basic-info/edit',
    )
  })

  it('프로필을 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useMyMover).mockReturnValue(
      createMyMoverResult({ mover: undefined, isPending: true }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '내 프로필을 불러오고 있습니다.',
    )
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMyMover).mockReturnValue(
      createMyMoverResult({ mover: undefined, isError: true, refetch }),
    )
    const user = userEvent.setup()

    render(<MyMoverProfile />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      '내 프로필을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })
})
