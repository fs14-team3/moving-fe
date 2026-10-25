import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileMenu from '@/components/layout/ProfileMenu'
import { PROFILE_MENU_ITEMS } from '@/constants/navigation'
import type { Me, Role } from '@/features/auth/types'

const logoutState = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }))

vi.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => logoutState,
}))

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김무빙',
    email: null,
    phone: null,
    hasProfile: true,
    customerProfile: null,
    moverProfile: null,
  }
}

function renderProfileMenu(role: Role = 'CUSTOMER') {
  const user = userEvent.setup()
  render(
    <>
      <ProfileMenu user={createUser(role)} />
      <p>바깥 영역</p>
    </>,
  )
  const trigger = screen.getByRole('button', { name: '프로필 메뉴' })
  return { user, trigger, open: () => user.click(trigger) }
}

describe('ProfileMenu', () => {
  beforeEach(() => {
    logoutState.mutate.mockClear()
    logoutState.isPending = false
  })

  it('프로필 버튼을 누를 때마다 메뉴를 열고 닫는다', async () => {
    const { trigger, open } = renderProfileMenu()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await open()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('고객님')).toBeInTheDocument()

    await open()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('고객님')).not.toBeInTheDocument()
  })

  it.each<Role>(['CUSTOMER', 'MOVER'])(
    '%s에게 맞는 메뉴를 보여 준다',
    async (role) => {
      const { open } = renderProfileMenu(role)

      await open()

      expect(
        screen.getAllByRole('link').map((link) => link.textContent),
      ).toEqual(PROFILE_MENU_ITEMS[role].map(({ label }) => label))
    },
  )

  it('Esc를 누르면 닫고 프로필 버튼으로 포커스를 돌려준다', async () => {
    const { user, trigger, open } = renderProfileMenu()
    await open()
    screen.getByRole('link', { name: '프로필 수정' }).focus()

    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('메뉴 바깥은 누르면 닫고, 안쪽은 눌러도 닫지 않는다', async () => {
    const { user, trigger, open } = renderProfileMenu()
    await open()

    await user.click(screen.getByText('고객님'))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByText('바깥 영역'))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('메뉴 항목을 누르면 이동하면서 닫는다', async () => {
    const { user, trigger, open } = renderProfileMenu()
    await open()

    const link = screen.getByRole('link', { name: '프로필 수정' })
    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('로그아웃 버튼을 누르면 로그아웃한다', async () => {
    const { user, open } = renderProfileMenu()
    await open()

    await user.click(screen.getByRole('button', { name: '로그아웃' }))

    expect(logoutState.mutate).toHaveBeenCalledOnce()
  })

  it('로그아웃 처리 중에는 로그아웃 버튼을 누를 수 없다', async () => {
    logoutState.isPending = true
    const { open } = renderProfileMenu()

    await open()

    expect(screen.getByRole('button', { name: '로그아웃' })).toBeDisabled()
  })
})
