import FavoritesPage from '@/app/favorites/page'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'
import { useFavoriteMovers } from '@/features/favorites/hooks/useFavoriteMovers'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/features/favorites/hooks/useFavoriteMovers', () => ({
  useFavoriteMovers: vi.fn(),
}))

vi.mock('@/components/mover/MoverCard', () => ({
  default: ({ mover }: { mover: { nickname: string | null } }) => (
    <article>{mover.nickname}</article>
  ),
}))

function createFavoritesResult(
  overrides: Partial<ReturnType<typeof useFavoriteMovers>> = {},
) {
  return {
    favoriteMovers: [MOCK_MOVERS[0]],
    isPending: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFavoriteMovers).mockReturnValue(createFavoritesResult())
  })

  it('찜한 기사님 목록을 보여 준다', () => {
    render(<FavoritesPage />)

    expect(
      screen.getByRole('heading', { name: '찜한 기사님' }),
    ).toBeInTheDocument()
    expect(screen.getByText('김무빙')).toBeInTheDocument()
  })

  it('처음 목록을 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useFavoriteMovers).mockReturnValue(
      createFavoritesResult({ favoriteMovers: [], isPending: true }),
    )

    render(<FavoritesPage />)

    expect(
      screen.getByText('찜한 기사님을 불러오고 있습니다.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('김무빙')).not.toBeInTheDocument()
  })

  it('처음 목록 조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useFavoriteMovers).mockReturnValue(
      createFavoritesResult({ favoriteMovers: [], isError: true, refetch }),
    )
    const user = userEvent.setup()

    render(<FavoritesPage />)

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('찜한 기사님이 없으면 빈 목록을 안내한다', () => {
    vi.mocked(useFavoriteMovers).mockReturnValue(
      createFavoritesResult({ favoriteMovers: [] }),
    )

    render(<FavoritesPage />)

    expect(screen.getByText('아직 찜한 기사님이 없어요!')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '기사님 찜하러 가기' }),
    ).toHaveAttribute('href', '/movers')
  })

  it('추가 목록 조회에 실패하면 기존 목록을 유지하고 다시 시도한다', async () => {
    const fetchNextPage = vi.fn()
    vi.mocked(useFavoriteMovers).mockReturnValue(
      createFavoritesResult({ isFetchNextPageError: true, fetchNextPage }),
    )
    const user = userEvent.setup()

    render(<FavoritesPage />)

    expect(screen.getByText('김무빙')).toBeInTheDocument()
    expect(
      screen.getByText('기사님을 추가로 불러오지 못했습니다.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })
})
