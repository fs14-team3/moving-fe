import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationMenu from '@/components/layout/NotificationMenu'
import {
  getNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
  type Notification,
} from '@/features/notifications/api'

vi.mock('@/features/notifications/api', () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  readAllNotifications: vi.fn(),
}))

const mockGetNotifications = vi.mocked(getNotifications)
const mockGetUnreadCount = vi.mocked(getUnreadNotificationCount)
const mockReadAll = vi.mocked(readAllNotifications)

function createNotification(
  overrides: Partial<Notification> & Pick<Notification, 'id'>,
): Notification {
  return {
    userId: 'user-1',
    type: 'NEW_QUOTE',
    message: '김코드 기사님의 소형이사 견적이 도착했어요',
    payload: {},
    readAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

function mockPage(items: Notification[]) {
  mockGetNotifications.mockResolvedValue({
    items,
    hasNext: false,
    nextCursor: null,
  })
}

function renderMenu() {
  const user = userEvent.setup()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <NotificationMenu />
      <p>바깥 영역</p>
    </QueryClientProvider>,
  )
  const getTrigger = () =>
    screen.getByRole('button', { name: /^알림(, 새 알림 있음)?$/ })
  return { user, getTrigger, open: () => user.click(getTrigger()) }
}

function getPanel() {
  return screen.getByRole('region', { name: '알림' })
}

function queryPanel() {
  return screen.queryByRole('region', { name: '알림' })
}

describe('NotificationMenu', () => {
  beforeEach(() => {
    mockGetUnreadCount.mockResolvedValue(0)
    mockReadAll.mockResolvedValue({ updatedCount: 0 })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('알림 아이콘을 누르기 전에는 알림 목록을 불러오지 않는다', async () => {
    mockPage([])
    renderMenu()

    await waitFor(() => expect(mockGetUnreadCount).toHaveBeenCalled())
    expect(mockGetNotifications).not.toHaveBeenCalled()
  })

  it('알림 아이콘을 누르면 알림 내용과 받은 시점을 보여 준다', async () => {
    mockPage([
      createNotification({ id: '1' }),
      createNotification({
        id: '2',
        type: 'QUOTE_CONFIRMED',
        message: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      }),
    ])
    const { open } = renderMenu()

    await open()

    const panel = getPanel()
    expect(
      await within(panel).findByText(
        '김코드 기사님의 소형이사 견적이 도착했어요',
      ),
    ).toBeInTheDocument()
    expect(within(panel).getByText('2시간 전')).toBeInTheDocument()
    // 서버가 문구를 주지 않으면 알림 종류에 맞는 기본 문구를 보여 준다.
    expect(within(panel).getByText('견적이 확정되었어요')).toBeInTheDocument()
    expect(within(panel).getByText('3시간 전')).toBeInTheDocument()
  })

  it('알림이 없으면 빈 목록 안내를 보여 준다', async () => {
    mockPage([])
    const { open } = renderMenu()

    await open()

    expect(
      await within(getPanel()).findByText('모든 알림을 확인하였습니다'),
    ).toBeInTheDocument()
  })

  it('읽지 않은 알림이 있을 때만 새 알림 표시를 한다', async () => {
    mockGetUnreadCount.mockResolvedValue(2)
    renderMenu()

    expect(
      await screen.findByRole('button', { name: '알림, 새 알림 있음' }),
    ).toBeInTheDocument()
  })

  it('알림 목록을 확인하고 닫으면 읽음 처리하고 새 알림 표시를 지운다', async () => {
    mockGetUnreadCount.mockResolvedValue(1)
    mockPage([createNotification({ id: '1' })])
    mockReadAll.mockResolvedValue({ updatedCount: 1 })
    const { user, open } = renderMenu()
    await screen.findByRole('button', { name: '알림, 새 알림 있음' })

    await open()
    await within(getPanel()).findByText(
      '김코드 기사님의 소형이사 견적이 도착했어요',
    )
    // 열어 둔 동안에는 읽음 처리하지 않는다.
    expect(mockReadAll).not.toHaveBeenCalled()

    await user.click(screen.getByText('바깥 영역'))

    expect(mockReadAll).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole('button', { name: '알림' }),
    ).toBeInTheDocument()
  })

  it('확인한 알림은 다시 열었을 때 목록에서 빠진다', async () => {
    mockGetUnreadCount.mockResolvedValue(1)
    mockGetNotifications
      .mockResolvedValueOnce({
        items: [createNotification({ id: '1' })],
        hasNext: false,
        nextCursor: null,
      })
      .mockResolvedValue({ items: [], hasNext: false, nextCursor: null })
    mockReadAll.mockResolvedValue({ updatedCount: 1 })
    const { getTrigger, open } = renderMenu()

    await open()
    await within(getPanel()).findByText(
      '김코드 기사님의 소형이사 견적이 도착했어요',
    )
    await open()
    await waitFor(() => expect(getTrigger()).toHaveAccessibleName('알림'))

    await open()

    expect(
      await within(getPanel()).findByText('모든 알림을 확인하였습니다'),
    ).toBeInTheDocument()
    expect(
      within(getPanel()).queryByText(
        '김코드 기사님의 소형이사 견적이 도착했어요',
      ),
    ).toBeNull()
  })

  it('읽지 않은 알림을 보여 주지 않았으면 닫아도 읽음 처리하지 않는다', async () => {
    mockPage([])
    const { user, open } = renderMenu()
    await open()
    await within(getPanel()).findByText('모든 알림을 확인하였습니다')

    await user.keyboard('{Escape}')

    expect(queryPanel()).toBeNull()
    expect(mockReadAll).not.toHaveBeenCalled()
  })

  it('Esc를 누르면 닫고 알림 아이콘으로 포커스를 돌려준다', async () => {
    mockPage([])
    const { user, getTrigger, open } = renderMenu()
    await open()

    await user.keyboard('{Escape}')

    expect(queryPanel()).toBeNull()
    expect(getTrigger()).toHaveFocus()
  })

  it('목록 바깥은 누르면 닫고, 안쪽은 눌러도 닫지 않는다', async () => {
    mockPage([])
    const { user, open } = renderMenu()
    await open()

    await user.click(
      await within(getPanel()).findByText('모든 알림을 확인하였습니다'),
    )
    expect(getPanel()).toBeInTheDocument()

    await user.click(screen.getByText('바깥 영역'))
    expect(queryPanel()).toBeNull()
  })

  it('닫기 버튼을 누르면 닫는다', async () => {
    mockPage([])
    const { user, getTrigger, open } = renderMenu()
    await open()

    await user.click(screen.getByRole('button', { name: '알림 닫기' }))

    expect(queryPanel()).toBeNull()
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    mockGetNotifications
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValue({ items: [], hasNext: false, nextCursor: null })
    const { user, open } = renderMenu()
    await open()

    const alert = await within(getPanel()).findByRole('alert')
    expect(alert).toHaveTextContent('알림을 불러오지 못했습니다.')
    await user.click(within(alert).getByRole('button', { name: '다시 시도' }))

    expect(
      await within(getPanel()).findByText('모든 알림을 확인하였습니다'),
    ).toBeInTheDocument()
  })
})
