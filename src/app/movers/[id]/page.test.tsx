import MoverDetailPage from '@/app/movers/[id]/page'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { Me } from '@/features/auth/types'
import { useAddFavorite } from '@/features/favorites/hooks/useAddFavorite'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { useMover } from '@/features/movers/hooks/useMover'
import { ApiError } from '@/lib/api-error'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  moverId: '1',
  replace: vi.fn(),
}))

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: navigation.moverId }),
  useRouter: () => ({ replace: navigation.replace }),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/movers/hooks/useMover', () => ({
  useMover: vi.fn(),
}))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('@/features/favorites/hooks/useAddFavorite', () => ({
  useAddFavorite: vi.fn(),
}))

vi.mock('@/features/favorites/hooks/useRemoveFavorite', () => ({
  useRemoveFavorite: vi.fn(),
}))

vi.mock('@/components/mover/KakaoScript', () => ({
  default: () => null,
}))

vi.mock('@/components/mover/review/ReviewSection', () => ({
  default: () => <section>리뷰 영역</section>,
}))

function createMoverResult(
  overrides: Partial<ReturnType<typeof useMover>> = {},
) {
  return {
    mover: MOCK_MOVER_DETAILS[0],
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
  customerProfile: null,
  moverProfile: null,
}

describe('MoverDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.moverId = '1'
    vi.mocked(useMover).mockReturnValue(createMoverResult())
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
  })

  it('기사님 상세 정보를 보여 준다', () => {
    render(<MoverDetailPage />)

    expect(
      screen.getByRole('heading', { name: '김무빙 기사님' }),
    ).toBeInTheDocument()
    expect(screen.getByText('리뷰 영역')).toBeInTheDocument()
  })

  it('상세 정보를 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useMover).mockReturnValue(
      createMoverResult({ mover: undefined, isPending: true }),
    )

    render(<MoverDetailPage />)

    expect(
      screen.getByText('기사님 정보를 불러오고 있습니다.'),
    ).toBeInTheDocument()
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMover).mockReturnValue(
      createMoverResult({
        mover: undefined,
        error: new Error('Network Error'),
        isError: true,
        refetch,
      }),
    )
    const user = userEvent.setup()

    render(<MoverDetailPage />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('기사님을 찾을 수 없으면 목록으로 이동한다', async () => {
    navigation.moverId = 'missing-mover'
    vi.mocked(useMover).mockReturnValue(
      createMoverResult({
        mover: undefined,
        error: new ApiError('NOT_FOUND', 'Not Found', 404),
        isError: true,
      }),
    )

    render(<MoverDetailPage />)

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('/movers'),
    )
    expect(toast.error).toHaveBeenCalledWith(
      '기사님 정보를 찾을 수 없습니다.',
      { id: 'mover-not-found' },
    )
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
    render(<MoverDetailPage />)
    await user.click(screen.getByRole('button', { name: '찜 해제' }))

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
    vi.mocked(useMover).mockReturnValue(
      createMoverResult({ mover: MOCK_MOVER_DETAILS[1] }),
    )
    vi.mocked(useAddFavorite).mockReturnValue({
      mutate: addFavorite,
      isPending: false,
    })

    const user = userEvent.setup()
    render(<MoverDetailPage />)
    await user.click(screen.getByRole('button', { name: '기사님 찜하기' }))

    expect(addFavorite).toHaveBeenCalled()
  })
})
