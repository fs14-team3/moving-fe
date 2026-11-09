import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { Me } from '@/features/auth/types'
import { useAddFavorite } from '@/features/favorites/hooks/useAddFavorite'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoverCard from './MoverCard'

const toast = vi.hoisted(() => ({ info: vi.fn() }))
const addFavorite = vi.hoisted(() => vi.fn())
const removeFavorite = vi.hoisted(() => vi.fn())

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
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

function renderCard(mover = MOCK_MOVERS[1]) {
  return render(<MoverCard mover={mover} />)
}

describe('MoverCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCurrentUser).mockReturnValue({
      user: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useAddFavorite).mockReturnValue({
      mutate: addFavorite,
      isPending: false,
    })
    vi.mocked(useRemoveFavorite).mockReturnValue({
      mutate: removeFavorite,
      isPending: false,
    })
  })

  it('로그인하지 않으면 찜 요청을 보내지 않는다', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: '찜하기' }))

    expect(toast.info).toHaveBeenCalledWith(
      TOAST_MESSAGES.favorite.loginRequired,
    )
    expect(addFavorite).not.toHaveBeenCalled()
    expect(removeFavorite).not.toHaveBeenCalled()
  })

  it('기사님 계정이면 찜 요청을 보내지 않는다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: { ...customer, role: 'MOVER' },
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: '찜하기' }))

    expect(toast.info).toHaveBeenCalledWith(
      TOAST_MESSAGES.favorite.customerOnly,
    )
    expect(addFavorite).not.toHaveBeenCalled()
    expect(removeFavorite).not.toHaveBeenCalled()
  })

  it('프로필이 없으면 찜 요청을 보내지 않는다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: { ...customer, role: 'CUSTOMER', hasProfile: false },
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: '찜하기' }))

    expect(toast.info).toHaveBeenCalledWith(
      TOAST_MESSAGES.favorite.profileRequired,
    )
    expect(addFavorite).not.toHaveBeenCalled()
    expect(removeFavorite).not.toHaveBeenCalled()
  })

  it('찜하지 않은 기사님은 찜한다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: '찜하기' }))

    expect(addFavorite).toHaveBeenCalled()
    expect(removeFavorite).not.toHaveBeenCalled()
    expect(toast.info).not.toHaveBeenCalled()
  })

  it('찜한 기사님은 찜을 해제한다', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup()
    renderCard(MOCK_MOVERS[0])

    await user.click(screen.getByRole('button', { name: '찜 해제' }))

    expect(removeFavorite).toHaveBeenCalled()
    expect(addFavorite).not.toHaveBeenCalled()
    expect(toast.info).not.toHaveBeenCalled()
  })
})
