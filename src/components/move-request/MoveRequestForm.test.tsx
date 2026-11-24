import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import MoveRequestForm from '@/components/move-request/MoveRequestForm'
import { getMoveEstimate } from '@/features/move-estimate/api'
import { MOCK_MOVE_REQUEST_DETAILS } from '@/features/move-request/fixtures/moveRequests'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'

const createMoveRequest = vi.hoisted(() => ({ mutate: vi.fn() }))
const router = vi.hoisted(() => ({ replace: vi.fn() }))
const leaveGuard = vi.hoisted(() => ({
  isOpen: false,
  stay: vi.fn(),
  leave: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}))

vi.mock('@/hooks/useLeaveGuard', () => ({
  useLeaveGuard: vi.fn(),
}))

vi.mock('@/features/move-estimate/api', () => ({
  getMoveEstimate: vi.fn(),
}))

vi.mock('@/features/move-request/hooks/useCreateMoveRequest', () => ({
  useCreateMoveRequest: () => ({
    mutate: createMoveRequest.mutate,
    isPending: false,
  }),
}))

// 날짜 선택과 주소 검색은 각자 테스트가 있으니 값만 넘기는 버튼으로 바꾼다.
vi.mock('@/components/move-request/MoveTypeStep', () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <>
      <button type="button" onClick={() => onChange('HOME')}>
        가정이사 선택
      </button>
      <button type="button" onClick={() => onChange('OFFICE')}>
        사무실이사 선택
      </button>
    </>
  ),
}))

vi.mock('@/components/move-request/MoveDateStep', () => ({
  default: ({ onChange }: { onChange: (value: Date) => void }) => (
    <button type="button" onClick={() => onChange(new Date(2026, 11, 5))}>
      날짜 선택
    </button>
  ),
}))

vi.mock('@/components/move-request/MoveAddressStep', () => ({
  default: ({
    onDepartureChange,
    onArrivalChange,
  }: {
    onDepartureChange: (address: object) => void
    onArrivalChange: (address: object) => void
  }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onDepartureChange({
            address: '서울 중구 세종대로 110',
            zonecode: '04524',
          })
        }
      >
        출발지 선택
      </button>
      <button
        type="button"
        onClick={() =>
          onArrivalChange({
            address: '서울 강남구 테헤란로 152',
            zonecode: '06236',
          })
        }
      >
        도착지 선택
      </button>
    </>
  ),
}))

const ESTIMATE = {
  distanceKm: 12.3,
  minPrice: 710_000,
  maxPrice: 950_000,
  surcharges: [],
}

function renderForm() {
  const queryClient = new QueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <MoveRequestForm />
    </QueryClientProvider>,
  )

  return userEvent.setup()
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '가정이사 선택' }))
  await user.click(screen.getByRole('button', { name: '날짜 선택' }))
  await user.click(screen.getByRole('button', { name: '출발지 선택' }))
  await user.click(screen.getByRole('button', { name: '도착지 선택' }))
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  group: string,
  option: string,
) {
  await user.click(
    within(within(container).getByRole('group', { name: group })).getByRole(
      'button',
      { name: option },
    ),
  )
}

async function goToDetails(user: ReturnType<typeof userEvent.setup>) {
  await fillForm(user)
  const [, desktopNext] = screen.getAllByRole('button', { name: '다음' })
  await user.click(desktopNext)
}

async function fillDetailsExceptBoxes(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole('button', { name: /^반포장이사/ }))
  await choose(user, document.body, '평수', '20평대')
  await choose(user, document.body, '거주 인원', '2인')

  const from = screen.getByRole('region', { name: '출발지' })
  await choose(user, from, '건물 형태', '빌라·연립')
  await choose(user, from, '층수', '3층')
  await choose(user, from, '엘리베이터', '없음')
  await choose(user, from, '건물 앞 주차', '가능')

  const to = screen.getByRole('region', { name: '도착지' })
  await choose(user, to, '건물 형태', '아파트')
  await choose(user, to, '층수', '5층 이상')
  await choose(user, to, '엘리베이터', '있음')
  await choose(user, to, '건물 앞 주차', '불가능')

  await user.click(screen.getByRole('button', { name: '침대(퀸) 더하기' }))
  await user.click(screen.getByRole('button', { name: '침대(퀸) 더하기' }))
  await user.click(screen.getByRole('button', { name: '가전' }))
  await user.click(
    screen.getByRole('button', { name: '에어컨(스탠드) 더하기' }),
  )
  await user.type(
    screen.getByLabelText(/기사님께 전할 말/),
    MOCK_MOVE_REQUEST_DETAILS.memo ?? '',
  )
}

async function goToReview(user: ReturnType<typeof userEvent.setup>) {
  await goToDetails(user)
  await fillDetailsExceptBoxes(user)
  await choose(user, document.body, '잔짐 박스', '21~30개')
  const [, desktopNext] = screen.getAllByRole('button', { name: '다음' })
  await user.click(desktopNext)
}

async function submit(user: ReturnType<typeof userEvent.setup>) {
  const [, desktopSubmit] = screen.getAllByRole('button', {
    name: '견적 요청하기',
  })
  await user.click(desktopSubmit)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard })
})

describe('MoveRequestForm 예상 비용', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('입력이 다 채워지기 전에는 예상 비용을 조회하지 않는다', async () => {
    const user = renderForm()

    await user.click(screen.getByRole('button', { name: '가정이사 선택' }))
    await user.click(screen.getByRole('button', { name: '날짜 선택' }))
    await user.click(screen.getByRole('button', { name: '출발지 선택' }))

    expect(getMoveEstimate).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('region', { name: '예상 비용' }),
    ).not.toBeInTheDocument()
  })

  it('입력을 다 채우면 예상 비용을 조회해 보여 준다', async () => {
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
    const user = renderForm()

    await fillForm(user)

    expect(
      await screen.findByRole('region', { name: '예상 비용' }),
    ).toHaveTextContent('약 71만 ~ 95만 원')
    expect(getMoveEstimate).toHaveBeenCalledWith(
      {
        moveType: 'HOME',
        moveDate: '2026-12-05',
        from: '서울 중구 세종대로 110',
        to: '서울 강남구 테헤란로 152',
      },
      expect.any(AbortSignal),
    )
  })

  it('계산하는 동안 로딩 문구를 보여 준다', async () => {
    vi.mocked(getMoveEstimate).mockReturnValue(new Promise(() => {}))
    const user = renderForm()

    await fillForm(user)

    expect(screen.getByRole('status')).toHaveTextContent(
      '예상 비용을 계산하고 있어요',
    )
  })

  it('예상 비용을 계산하지 못하면 카드를 숨긴다', async () => {
    vi.mocked(getMoveEstimate).mockRejectedValue(
      new Error('주소를 찾을 수 없습니다'),
    )
    const user = renderForm()

    await fillForm(user)

    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('region', { name: '예상 비용' }),
    ).not.toBeInTheDocument()
    // 참고용이라 실패해도 다시 시도하지 않는다.
    expect(getMoveEstimate).toHaveBeenCalledOnce()
  })
})

describe('MoveRequestForm 상세 정보', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
  })

  it('기본 정보 다음에 상세 정보를 모두 고르면 짐 목록, 요청사항과 함께 요청한다', async () => {
    const user = renderForm()
    await goToDetails(user)
    await fillDetailsExceptBoxes(user)
    const [, desktopNext] = screen.getAllByRole('button', { name: '다음' })

    expect(desktopNext).toBeDisabled()

    await choose(user, document.body, '잔짐 박스', '21~30개')
    await user.click(desktopNext)
    await submit(user)

    expect(createMoveRequest.mutate).toHaveBeenCalledWith(
      {
        moveType: 'HOME',
        moveDate: '2026-12-05',
        from: { address: '서울 중구 세종대로 110', zonecode: '04524' },
        to: { address: '서울 강남구 테헤란로 152', zonecode: '06236' },
        details: {
          ...MOCK_MOVE_REQUEST_DETAILS,
          items: [
            { item: 'BED_QUEEN', quantity: 2 },
            { item: 'AIRCON_STAND', quantity: 1 },
          ],
        },
      },
      expect.any(Object),
    )
  })

  it('사무실이사는 거주 인원을 묻지 않는다', async () => {
    const user = renderForm()

    await user.click(screen.getByRole('button', { name: '사무실이사 선택' }))

    expect(
      screen.queryByRole('group', { name: '거주 인원' }),
    ).not.toBeInTheDocument()
  })
})

describe('MoveRequestForm 입력 내용 확인', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
  })

  it('요청하기 전에 입력한 기본 정보와 상세 정보를 보여 준다', async () => {
    const user = renderForm()

    expect(
      screen.queryByRole('region', { name: '기본 정보' }),
    ).not.toBeInTheDocument()

    await goToReview(user)

    const basic = screen.getByRole('region', { name: '기본 정보' })
    expect(basic).toHaveTextContent('가정이사')
    expect(basic).toHaveTextContent('2026년 12월 05일 (토)')
    expect(basic).toHaveTextContent('서울 중구 세종대로 110')
    expect(basic).toHaveTextContent('서울 강남구 테헤란로 152')

    const details = screen.getByRole('region', { name: '상세 정보' })
    expect(details).toHaveTextContent('반포장이사')
    expect(details).toHaveTextContent('침대(퀸) 2개, 에어컨(스탠드) 1개')
    expect(details).toHaveTextContent('21~30개')
    expect(details).toHaveTextContent(MOCK_MOVE_REQUEST_DETAILS.memo ?? '')
    expect(createMoveRequest.mutate).not.toHaveBeenCalled()
  })

  it('수정을 누르면 해당 단계로 돌아가고 입력한 값은 남아 있다', async () => {
    const user = renderForm()
    await goToReview(user)

    await user.click(screen.getByRole('button', { name: '기본 정보 수정' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '이사 유형을 선택해주세요',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: '기본 정보' }),
    ).not.toBeInTheDocument()

    const [, basicNext] = screen.getAllByRole('button', { name: '다음' })
    await user.click(basicNext)
    const [, detailsNext] = screen.getAllByRole('button', { name: '다음' })
    await user.click(detailsNext)
    await user.click(screen.getByRole('button', { name: '상세 정보 수정' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '이사 방식과 집 규모를 알려주세요',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '다음' })[1]).toBeEnabled()
  })

  it('모바일에서는 요청사항 다음 단계에서 확인하고 요청한다', async () => {
    const user = renderForm()
    await fillForm(user)
    await fillDetailsExceptBoxes(user)
    await choose(user, document.body, '잔짐 박스', '21~30개')

    for (let step = 1; step < 8; step += 1) {
      const [mobileNext] = screen.getAllByRole('button', { name: '다음' })
      await user.click(mobileNext)
    }

    expect(
      screen.queryByRole('button', { name: '다음' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: '상세 정보' }),
    ).toBeInTheDocument()

    const [mobileSubmit] = screen.getAllByRole('button', {
      name: '견적 요청하기',
    })
    await user.click(mobileSubmit)

    expect(createMoveRequest.mutate).toHaveBeenCalledOnce()
  })
})

describe('MoveRequestForm 나가기 확인', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
  })

  it('입력을 시작하면 나가기 전에 묻는다', async () => {
    const user = renderForm()
    expect(useLeaveGuard).toHaveBeenLastCalledWith(false, '/')

    await user.click(screen.getByRole('button', { name: '가정이사 선택' }))

    expect(useLeaveGuard).toHaveBeenLastCalledWith(true, '/')
  })

  it('상세 정보만 입력해도 나가기 전에 묻는다', async () => {
    const user = renderForm()

    await user.click(screen.getByRole('button', { name: /^반포장이사/ }))

    expect(useLeaveGuard).toHaveBeenLastCalledWith(true, '/')
  })

  it('나가려고 하면 확인 창을 띄우고 고른 대로 처리한다', async () => {
    vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard, isOpen: true })
    const user = renderForm()

    const dialog = screen.getByRole('dialog', { name: '페이지를 나갈까요?' })
    expect(dialog).toHaveTextContent('나가면 입력한 내용이 사라져요.')

    await user.click(within(dialog).getByRole('button', { name: '취소' }))
    expect(leaveGuard.stay).toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: '나가기' }))
    expect(leaveGuard.leave).toHaveBeenCalled()
  })

  it('요청을 보내면 묻지 않고 내 견적 관리로 간다', async () => {
    const user = renderForm()
    await goToReview(user)
    await submit(user)

    const [, { onSuccess }] = createMoveRequest.mutate.mock.calls[0]
    onSuccess()

    expect(leaveGuard.leave).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/my-quotes')
  })
})
