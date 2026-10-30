import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoversPage from '@/app/movers/page'
import type { Me } from '@/features/auth/types'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useFavoriteMovers } from '@/features/movers/hooks/useFavoriteMovers'
import { useMovers } from '@/features/movers/hooks/useMovers'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'

const navigation = vi.hoisted(() => ({
  pathname: '/movers',
  query: '',
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('@/features/movers/hooks/useMovers', () => ({
  useMovers: vi.fn(),
}))

vi.mock('@/features/movers/hooks/useFavoriteMovers', () => ({
  useFavoriteMovers: vi.fn(),
}))

vi.mock('@/components/common/input/SearchInput', () => ({
  default: ({
    value,
    onChange,
    onSearch,
  }: {
    value?: string
    onChange?: (value: string) => void
    onSearch?: (value: string) => void
  }) => (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch?.(value ?? '')
      }}
    >
      <input
        aria-label="검색어"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <button type="submit">검색</button>
    </form>
  ),
}))

vi.mock('@/components/common/dropdown/RegionDropdown', () => ({
  default: ({
    value,
    onChange,
  }: {
    value?: string
    onChange?: (value: string) => void
  }) => (
    <select
      aria-label="지역"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="all">전체</option>
      <option value="서울">서울</option>
    </select>
  ),
}))

vi.mock('@/components/common/dropdown/ServiceDropdown', () => ({
  default: ({
    value,
    onChange,
  }: {
    value?: string
    onChange?: (value: string) => void
  }) => (
    <select
      aria-label="서비스"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="all">전체</option>
      <option value="HOME">가정이사</option>
    </select>
  ),
}))

vi.mock('@/components/common/dropdown/SortDropdown', () => ({
  default: ({
    value,
    onChange,
  }: {
    value?: string
    onChange?: (value: string) => void
  }) => (
    <select
      aria-label="정렬"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="REVIEW_COUNT">리뷰 많은순</option>
      <option value="RATING">평점 높은순</option>
    </select>
  ),
}))

vi.mock('@/components/mover/MoverList', () => ({
  default: ({ movers }: { movers: typeof MOCK_MOVERS }) => (
    <ul>
      {movers.map((mover) => (
        <li key={mover.id}>{mover.nickname}</li>
      ))}
    </ul>
  ),
}))

vi.mock('@/components/mover/FavoriteMoverCard', () => ({
  default: ({ mover }: { mover: (typeof MOCK_MOVERS)[number] }) => (
    <article>{mover.nickname}</article>
  ),
}))

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

function createMoversResult(
  overrides: Partial<ReturnType<typeof useMovers>> = {},
) {
  return {
    movers: [MOCK_MOVERS[0]],
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

function createFavoritesResult(
  overrides: Partial<ReturnType<typeof useFavoriteMovers>> = {},
) {
  return {
    favoriteMovers: [],
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

describe('MoversPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.query = ''
    vi.mocked(useCurrentUser).mockReturnValue({
      user: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useMovers).mockReturnValue(createMoversResult())
    vi.mocked(useFavoriteMovers).mockReturnValue(createFavoritesResult())
  })

  it('URL의 검색·필터·정렬 조건으로 기사님을 조회한다', () => {
    navigation.query =
      'keyword=%EA%B9%80%EB%AC%B4%EB%B9%99&region=%EC%84%9C%EC%9A%B8&serviceType=HOME&sort=RATING'

    render(<MoversPage />)

    expect(useMovers).toHaveBeenCalledWith({
      keyword: '김무빙',
      region: '서울',
      serviceType: 'HOME',
      sort: 'RATING',
    })
  })

  it('검색어를 URL에 반영하고 검색 조건을 초기화한다', async () => {
    const user = userEvent.setup()
    render(<MoversPage />)

    await user.type(screen.getByRole('textbox', { name: '검색어' }), ' 김무빙 ')
    await user.click(screen.getByRole('button', { name: '검색' }))

    expect(navigation.replace).toHaveBeenCalledWith(
      '/movers?keyword=%EA%B9%80%EB%AC%B4%EB%B9%99',
      { scroll: false },
    )

    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }))
    expect(navigation.replace).toHaveBeenLastCalledWith('/movers', {
      scroll: false,
    })
  })

  it('처음 목록을 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useMovers).mockReturnValue(
      createMoversResult({ movers: [], isPending: true }),
    )

    render(<MoversPage />)

    expect(
      screen.getByText('기사님 목록을 불러오고 있습니다.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('김무빙')).not.toBeInTheDocument()
  })

  it('처음 목록 조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMovers).mockReturnValue(
      createMoversResult({ movers: [], isError: true, refetch }),
    )
    const user = userEvent.setup()

    render(<MoversPage />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('조건에 맞는 기사님이 없으면 빈 목록을 안내한다', () => {
    vi.mocked(useMovers).mockReturnValue(createMoversResult({ movers: [] }))

    render(<MoversPage />)

    expect(
      screen.getByText('조건에 맞는 기사님이 없습니다.'),
    ).toBeInTheDocument()
  })

  it('추가 목록 조회에 실패하면 기존 목록을 유지하고 다시 시도한다', async () => {
    const fetchNextPage = vi.fn()
    vi.mocked(useMovers).mockReturnValue(
      createMoversResult({
        isError: true,
        isFetchNextPageError: true,
        fetchNextPage,
      }),
    )
    const user = userEvent.setup()

    render(<MoversPage />)

    expect(screen.getByText('김무빙')).toBeInTheDocument()
    expect(
      screen.getByText('기사님을 추가로 불러오지 못했습니다.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(fetchNextPage).toHaveBeenCalledOnce()
  })

  it('일반 유저에게만 찜한 기사님 영역을 보여 준다', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: customer,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    vi.mocked(useFavoriteMovers).mockReturnValue(
      createFavoritesResult({ favoriteMovers: [MOCK_MOVERS[1]] }),
    )

    const { rerender } = render(<MoversPage />)

    expect(
      screen.getByRole('heading', { name: '찜한 기사님' }),
    ).toBeInTheDocument()
    expect(screen.getByText('이친절')).toBeInTheDocument()
    expect(useFavoriteMovers).toHaveBeenCalledWith(
      { limit: 3 },
      { enabled: true },
    )

    vi.mocked(useCurrentUser).mockReturnValue({
      user: null,
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
    rerender(<MoversPage />)

    expect(
      screen.queryByRole('heading', { name: '찜한 기사님' }),
    ).not.toBeInTheDocument()
    expect(useFavoriteMovers).toHaveBeenLastCalledWith(
      { limit: 3 },
      { enabled: false },
    )
  })

  it('필터를 바꾸면 해당 조건을 URL에 반영한다', () => {
    render(<MoversPage />)

    fireEvent.change(screen.getByRole('combobox', { name: '지역' }), {
      target: { value: '서울' },
    })

    expect(navigation.replace).toHaveBeenCalledWith(
      '/movers?region=%EC%84%9C%EC%9A%B8',
      { scroll: false },
    )
  })
})
