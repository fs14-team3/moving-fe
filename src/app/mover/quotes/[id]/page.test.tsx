import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SentQuoteDetailPage from '@/app/mover/quotes/[id]/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { MOCK_SENT_QUOTE } from '@/features/sent-quotes/fixtures/sentQuotes'
import { useSentQuote } from '@/features/sent-quotes/hooks/useSentQuote'
import { ApiError } from '@/lib/api-error'

const navigation = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'quote-1' }),
  useRouter: () => ({ replace: navigation.replace }),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/sent-quotes/hooks/useSentQuote', () => ({
  useSentQuote: vi.fn(),
}))

function createQuoteResult(
  overrides: Partial<ReturnType<typeof useSentQuote>> = {},
) {
  return {
    quote: MOCK_SENT_QUOTE,
    error: null,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('SentQuoteDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSentQuote).mockReturnValue(createQuoteResult())
  })

  it('보낸 견적의 고객, 견적가, 견적 정보를 보여준다', () => {
    render(<SentQuoteDetailPage />)

    expect(useSentQuote).toHaveBeenCalledWith('quote-1')
    expect(
      screen.getByRole('heading', { name: '견적 상세' }),
    ).toBeInTheDocument()
    expect(screen.getByText('김민서 고객님')).toBeInTheDocument()
    expect(screen.getByText('지정 견적 요청')).toBeInTheDocument()
    expect(screen.getByText('180,000원')).toBeInTheDocument()
    expect(screen.getByText('2026년 10월 30일')).toBeInTheDocument()
    expect(screen.getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(screen.getByText('서울특별시 중구 세종대로 110')).toBeInTheDocument()
    expect(
      screen.getByText('경기도 수원시 팔달구 효원로 1'),
    ).toBeInTheDocument()
    expect(screen.queryByText('확정견적')).not.toBeInTheDocument()
  })

  it('확정된 견적은 확정견적으로 표시한다', () => {
    vi.mocked(useSentQuote).mockReturnValue(
      createQuoteResult({ quote: { ...MOCK_SENT_QUOTE, status: 'CONFIRMED' } }),
    )

    render(<SentQuoteDetailPage />)

    expect(screen.getByText('확정견적')).toBeInTheDocument()
  })

  it('불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(useSentQuote).mockReturnValue(
      createQuoteResult({ quote: undefined, isPending: true }),
    )

    render(<SentQuoteDetailPage />)

    expect(
      screen.getByText('견적 정보를 불러오고 있습니다.'),
    ).toBeInTheDocument()
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useSentQuote).mockReturnValue(
      createQuoteResult({
        quote: undefined,
        error: new Error('Network Error'),
        isError: true,
        refetch,
      }),
    )
    const user = userEvent.setup()

    render(<SentQuoteDetailPage />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('견적을 찾을 수 없으면 보낸 견적 목록으로 이동한다', async () => {
    vi.mocked(useSentQuote).mockReturnValue(
      createQuoteResult({
        quote: undefined,
        error: new ApiError('NOT_FOUND', 'Not Found', 404),
        isError: true,
      }),
    )

    render(<SentQuoteDetailPage />)

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('/mover/quotes'),
    )
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.quote.notFound, {
      id: 'quote-not-found',
    })
  })
})
