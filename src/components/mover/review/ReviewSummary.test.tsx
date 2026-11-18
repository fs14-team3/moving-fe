import { MOCK_REVIEW_SUMMARY } from '@/features/movers/fixtures/reviews'
import { useMoverReviewSummary } from '@/features/movers/hooks/useMoverReviewSummary'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReviewSummary from './ReviewSummary'

vi.mock('@/features/movers/hooks/useMoverReviewSummary', () => ({
  useMoverReviewSummary: vi.fn(),
}))

function createReviewSummaryResult(
  overrides: Partial<ReturnType<typeof useMoverReviewSummary>> = {},
) {
  return {
    reviewSummary: MOCK_REVIEW_SUMMARY,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    isRefetching: false,
    ...overrides,
  }
}

describe('ReviewSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('리뷰 요약을 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(useMoverReviewSummary).mockReturnValue(
      createReviewSummaryResult({ reviewSummary: undefined, isPending: true }),
    )

    render(<ReviewSummary moverId="1" />)

    expect(
      screen.getByText('리뷰 요약을 불러오고 있습니다.'),
    ).toBeInTheDocument()
    expect(useMoverReviewSummary).toHaveBeenCalledWith('1')
  })

  it('요약이 없으면 null을 반환한다', () => {
    vi.mocked(useMoverReviewSummary).mockReturnValue(
      createReviewSummaryResult({ reviewSummary: null }),
    )

    const { container } = render(<ReviewSummary moverId="1" />)

    expect(container).toBeEmptyDOMElement()
    expect(useMoverReviewSummary).toHaveBeenCalledWith('1')
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMoverReviewSummary).mockReturnValue(
      createReviewSummaryResult({
        reviewSummary: undefined,
        isError: true,
        refetch,
      }),
    )
    const user = userEvent.setup()

    render(<ReviewSummary moverId="1" />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('다시 불러오다 실패해도 불러온 요약을 계속 보여준다', () => {
    vi.mocked(useMoverReviewSummary).mockReturnValue(
      createReviewSummaryResult({ isError: true }),
    )

    render(<ReviewSummary moverId="1" />)

    expect(screen.getByText(MOCK_REVIEW_SUMMARY.summary)).toBeInTheDocument()
    expect(screen.getByText('(24건 기준)')).toBeInTheDocument()
    expect(screen.getAllByText('시간 약속')).toHaveLength(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
