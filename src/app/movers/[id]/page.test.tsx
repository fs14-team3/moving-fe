import MoverDetailPage from '@/app/movers/[id]/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { Me } from '@/features/auth/types'
import { useAddFavorite } from '@/features/favorites/hooks/useAddFavorite'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { MOCK_MOVE_REQUEST } from '@/features/move-request/fixtures/moveRequests'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import { useCreateDesignation } from '@/features/move-request/hooks/useCreateDesignation'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { useMover } from '@/features/movers/hooks/useMover'
import { ApiError } from '@/lib/api-error'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  moverId: '1',
  replace: vi.fn(),
}))

const toast = vi.hoisted(() => ({
  info: vi.fn(),
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

vi.mock('@/features/move-request/hooks/useActiveMoveRequest', () => ({
  useActiveMoveRequest: vi.fn(),
}))

vi.mock('@/features/move-request/hooks/useCreateDesignation', () => ({
  useCreateDesignation: vi.fn(),
}))

vi.mock('@/components/share/KakaoScript', () => ({
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
  isProfileComplete: true,
  customerProfile: null,
  moverProfile: null,
}

describe('MoverDetailPage', () => {
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
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useCreateDesignation).mockReturnValue({
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

  it('다시 불러오다 실패해도 불러온 기사님 정보를 계속 보여 준다', () => {
    vi.mocked(useMover).mockReturnValue(
      createMoverResult({ error: new Error('Network Error'), isError: true }),
    )

    render(<MoverDetailPage />)

    expect(
      screen.getByRole('heading', { name: '김무빙 기사님' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
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
    await user.click(screen.getAllByRole('button', { name: '찜 해제' })[0])

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

  it('진행 중인 견적 조회에 실패하면 오류를 알린다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: undefined,
      isPending: false,
      isError: true,
      isRefetching: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()

    render(<MoverDetailPage />)

    await user.click(screen.getByRole('button', { name: '지정 견적 요청하기' }))
    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.requestFailed,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('진행 중인 견적이 있으면 지정 견적을 요청한다', async () => {
    const createDesignation = vi.fn()

    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: MOCK_MOVE_REQUEST,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useCreateDesignation).mockReturnValue({
      mutate: createDesignation,
      isPending: false,
    })
    const user = userEvent.setup()

    render(<MoverDetailPage />)

    await user.click(screen.getByRole('button', { name: '지정 견적 요청하기' }))
    expect(createDesignation).toHaveBeenCalledWith(
      {
        requestId: MOCK_MOVE_REQUEST.id,
        moverId: '1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('확정된 요청이면 지정 견적을 요청하지 않는다', async () => {
    const createDesignation = vi.fn()

    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: { ...MOCK_MOVE_REQUEST, status: 'CONFIRMED' },
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useCreateDesignation).mockReturnValue({
      mutate: createDesignation,
      isPending: false,
    })
    const user = userEvent.setup()

    render(<MoverDetailPage />)

    await user.click(screen.getByRole('button', { name: '지정 견적 요청하기' }))

    expect(createDesignation).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.requestNotPending,
    )
  })

  it('진행 중인 견적을 다시 불러오다 실패해도 불러온 견적으로 지정 견적을 요청한다', async () => {
    const createDesignation = vi.fn()

    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: MOCK_MOVE_REQUEST,
      isPending: false,
      isError: true,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useCreateDesignation).mockReturnValue({
      mutate: createDesignation,
      isPending: false,
    })
    const user = userEvent.setup()

    render(<MoverDetailPage />)

    await user.click(screen.getByRole('button', { name: '지정 견적 요청하기' }))
    expect(toast.error).not.toHaveBeenCalled()
    expect(createDesignation).toHaveBeenCalledWith(
      {
        requestId: MOCK_MOVE_REQUEST.id,
        moverId: '1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('진행 중인 견적이 없으면 일반 견적 요청 모달을 연다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useActiveMoveRequest).mockReturnValue({
      activeMoveRequest: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()

    render(<MoverDetailPage />)

    await user.click(screen.getByRole('button', { name: '지정 견적 요청하기' }))
    expect(
      screen.getByRole('dialog', { name: '지정 견적 요청하기' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('일반 견적 요청을 먼저 진행해 주세요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '일반 견적 요청 하기' }),
    ).toHaveAttribute('href', '/request')
  })
})
