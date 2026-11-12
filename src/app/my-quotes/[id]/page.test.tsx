import QuoteDetail from '@/app/my-quotes/[id]/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { Me } from '@/features/auth/types'
import { useAddFavorite } from '@/features/favorites/hooks/useAddFavorite'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { MOCK_QUOTE_DETAIL } from '@/features/my-quotes/fixtures/quotes'
import { useConfirmQuote } from '@/features/my-quotes/hooks/useConfirmQuote'
import { useQuoteDetail } from '@/features/my-quotes/hooks/useQuoteDetail'
import { ApiError } from '@/lib/api-error'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  quoteId: 'quote-1',
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: navigation.quoteId }),
  useRouter: () => ({ replace: navigation.replace }),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/components/share/KakaoScript', () => ({
  default: () => null,
}))

const toast = vi.hoisted(() => ({
  error: vi.fn(),
}))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('@/features/favorites/hooks/useAddFavorite', () => ({
  useAddFavorite: vi.fn(),
}))

vi.mock('@/features/favorites/hooks/useRemoveFavorite', () => ({
  useRemoveFavorite: vi.fn(),
}))

vi.mock('@/features/my-quotes/hooks/useQuoteDetail', () => ({
  useQuoteDetail: vi.fn(),
}))

vi.mock('@/features/my-quotes/hooks/useConfirmQuote', () => ({
  useConfirmQuote: vi.fn(),
}))

function createQuoteResult(
  overrides: Partial<ReturnType<typeof useQuoteDetail>> = {},
) {
  return {
    quote: MOCK_QUOTE_DETAIL,
    error: null,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

const customer: Me = {
  id: 'customer-1',
  role: 'CUSTOMER',
  name: '김고객',
  email: null,
  phone: null,
  hasProfile: true,
  isProfileComplete: true,
  customerProfile: null,
  moverProfile: null,
}

describe('QuoteDetailPage', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    navigation.quoteId = 'quote-1'
    vi.mocked(useQuoteDetail).mockReturnValue(createQuoteResult())
    vi.mocked(useCurrentUser).mockReturnValue({
      user: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useAddFavorite).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    vi.mocked(useRemoveFavorite).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    vi.mocked(useConfirmQuote).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useConfirmQuote>)
  })

  it('견적 상세 정보를 보여준다', () => {
    render(<QuoteDetail />)

    expect(
      screen.getByRole('heading', { name: '견적 상세' }),
    ).toBeInTheDocument()
    expect(screen.getByText('김코드 기사님')).toBeInTheDocument()
  })

  it('상세 정보를 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({ quote: undefined, isPending: true }),
    )

    render(<QuoteDetail />)

    expect(
      screen.getByText('견적 정보를 불러오고 있습니다.'),
    ).toBeInTheDocument()
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({
        quote: undefined,
        error: new Error('Network Error'),
        isError: true,
        refetch,
      }),
    )
    const user = userEvent.setup()

    render(<QuoteDetail />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('다시 불러오다 실패해도 불러온 견적 정보를 계속 보여준다', () => {
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({ error: new Error('Network Error'), isError: true }),
    )

    render(<QuoteDetail />)

    expect(screen.getByText('김코드 기사님')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('견적을 찾을 수 없으면 목록으로 이동한다', async () => {
    navigation.quoteId = 'missing-quote'
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({
        quote: undefined,
        error: new ApiError('NOT_FOUND', 'Not Found', 404),
        isError: true,
      }),
    )

    render(<QuoteDetail />)

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('/my-quotes'),
    )
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.quote.notFound, {
      id: 'quote-not-found',
    })
  })

  it('찜한 기사님은 찜을 해제한다', async () => {
    const removeFavorite = vi.fn()
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useRemoveFavorite).mockReturnValue({
      mutate: removeFavorite,
      isPending: false,
    })

    const user = userEvent.setup()
    render(<QuoteDetail />)
    await user.click(screen.getByRole('button', { name: '찜 해제하기' }))

    expect(removeFavorite).toHaveBeenCalled()
  })

  it('찜하지 않은 기사님은 찜한다', async () => {
    const addFavorite = vi.fn()
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({
        quote: {
          ...MOCK_QUOTE_DETAIL,
          mover: { ...MOCK_QUOTE_DETAIL.mover, isFavorite: false },
        },
      }),
    )
    vi.mocked(useAddFavorite).mockReturnValue({
      mutate: addFavorite,
      isPending: false,
    })

    const user = userEvent.setup()
    render(<QuoteDetail />)
    await user.click(screen.getByRole('button', { name: '찜하기' }))

    expect(addFavorite).toHaveBeenCalled()
  })

  it('견적 확정하기를 누르면 확인 모달을 열고, 확정하기를 눌러야 그 견적을 확정한다', async () => {
    const confirmQuote = vi.fn(
      (_quoteId: string, options?: { onSettled?: () => void }) =>
        options?.onSettled?.(),
    )
    vi.mocked(useConfirmQuote).mockReturnValue({
      mutate: confirmQuote,
      isPending: false,
    } as unknown as ReturnType<typeof useConfirmQuote>)

    const user = userEvent.setup()
    render(<QuoteDetail />)
    await user.click(screen.getByRole('button', { name: '견적 확정하기' }))
    const dialog = screen.getByRole('dialog', { name: '견적 확정' })

    expect(confirmQuote).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: '확정하기' }))

    expect(confirmQuote).toHaveBeenCalledWith('quote-1', expect.anything())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('확인 모달에서 취소하면 확정하지 않고 닫는다', async () => {
    const confirmQuote = vi.fn()
    vi.mocked(useConfirmQuote).mockReturnValue({
      mutate: confirmQuote,
      isPending: false,
    } as unknown as ReturnType<typeof useConfirmQuote>)

    const user = userEvent.setup()
    render(<QuoteDetail />)
    await user.click(screen.getByRole('button', { name: '견적 확정하기' }))
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(confirmQuote).not.toHaveBeenCalled()
  })

  it('확정된 견적은 확정하기 버튼을 보여 주지 않는다', () => {
    vi.mocked(useQuoteDetail).mockReturnValue(
      createQuoteResult({
        quote: {
          ...MOCK_QUOTE_DETAIL,
          status: 'CONFIRMED',
        },
      }),
    )

    render(<QuoteDetail />)

    expect(
      screen.queryByRole('button', { name: '견적 확정하기' }),
    ).not.toBeInTheDocument()
  })
})
