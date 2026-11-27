import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import type { CustomerQuote } from '@/features/my-quotes/api'
import { compareQuotes } from '@/features/quotes-compare/api'
import type { QuoteComparison } from '@/features/quotes-compare/types'
import { ApiError } from '@/lib/api-error'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import QuoteCompareStep from './QuoteCompareStep'

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/quotes-compare/api', () => ({
  compareQuotes: vi.fn(),
}))

function createQuote(
  id: string,
  nickname: string,
  price: number,
): CustomerQuote {
  return {
    id,
    price,
    comment: null,
    status: 'SUBMITTED',
    isDesignated: false,
    createdAt: '2026-11-05T09:00:00.000Z',
    mover: {
      id: `mover-${id}`,
      nickname,
      imageUrl: null,
      intro: null,
      description: null,
      careerYears: 5,
      serviceTypes: ['SMALL'],
      averageRating: 4.5,
      reviewCount: 10,
      confirmedCount: 3,
      isFavorite: false,
      favoriteCount: 0,
    },
  }
}

const pendingQuotes = [
  createQuote('quote-1', '김기사', 300000),
  createQuote('quote-2', '이기사', 250000),
]

function toComparisonQuote(quote: CustomerQuote) {
  return {
    id: quote.id,
    price: quote.price,
    comment: quote.comment,
    mover: {
      nickname: quote.mover.nickname,
      careerYears: quote.mover.careerYears,
      averageRating: quote.mover.averageRating,
      reviewCount: quote.mover.reviewCount,
      reviewSummary: null,
      aspects: null,
    },
  }
}

function renderStep() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <QuoteCompareStep requestId="request-1" pendingQuotes={pendingQuotes} />
    </QueryClientProvider>,
  )

  return { user: userEvent.setup() }
}

describe('QuoteCompareStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('견적과 키워드를 골라 비교하면 추천과 비교 표를 보여준다', async () => {
    const comparison: QuoteComparison = {
      quotes: pendingQuotes.map(toComparisonQuote),
      recommendation: { quoteIds: ['quote-2'], reason: '가격이 가장 낮아요' },
    }
    vi.mocked(compareQuotes).mockResolvedValue(comparison)
    const { user } = renderStep()

    await user.click(screen.getByRole('button', { name: '견적 선택' }))
    await user.click(screen.getByRole('button', { name: /^김기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: /^이기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: '가격' }))
    await user.click(screen.getByRole('button', { name: '견적 비교하기' }))

    expect(await screen.findByText('가격이 가장 낮아요')).toBeInTheDocument()
    expect(screen.getByText('기사님을 추천해요!')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(compareQuotes).toHaveBeenCalledWith('request-1', {
      quoteIds: ['quote-1', 'quote-2'],
      keywords: ['PRICE'],
    })
  })

  it('비교할 수 없는 견적이 있으면 선택 화면에 남고 선택을 비운다', async () => {
    vi.mocked(compareQuotes).mockRejectedValue(
      new ApiError('NOT_FOUND', 'Not Found', 404),
    )
    const { user } = renderStep()

    await user.click(screen.getByRole('button', { name: '견적 선택' }))
    await user.click(screen.getByRole('button', { name: /^김기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: /^이기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: '가격' }))
    await user.click(screen.getByRole('button', { name: '견적 비교하기' }))

    await waitFor(() =>
      expect(screen.queryByText('김기사 기사님')).not.toBeInTheDocument(),
    )
    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.compareStale,
    )
    expect(screen.getByRole('button', { name: '가격' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: '견적 비교하기' })).toBeDisabled()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('추천할 견적이 없으면 추천할 기사님이 없다고 알린다', async () => {
    const comparison: QuoteComparison = {
      quotes: pendingQuotes.map(toComparisonQuote),
      recommendation: {
        quoteIds: [],
        reason: '선택한 기준에서 견적 간 차이가 없어요',
      },
    }
    vi.mocked(compareQuotes).mockResolvedValue(comparison)
    const { user } = renderStep()

    await user.click(screen.getByRole('button', { name: '견적 선택' }))
    await user.click(screen.getByRole('button', { name: /^김기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: /^이기사 기사님\(/ }))
    await user.click(screen.getByRole('button', { name: '가격' }))
    await user.click(screen.getByRole('button', { name: '견적 비교하기' }))

    expect(
      await screen.findByText('추천할 기사님이 없어요'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('선택한 기준에서 견적 간 차이가 없어요'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('추천')).not.toBeInTheDocument()
  })
})
