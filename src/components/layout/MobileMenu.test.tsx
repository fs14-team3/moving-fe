import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import MobileMenu from '@/components/layout/MobileMenu'

const items = [
  { label: '받은 요청', href: '/mover/requests' },
  { label: '내 견적 관리', href: '/mover/quotes' },
]

function renderOpenMenu() {
  const user = userEvent.setup()
  render(<MobileMenu items={items} pathname="/mover/requests" />)
  return {
    user,
    open: () => user.click(screen.getByRole('button', { name: '메뉴 열기' })),
  }
}

describe('MobileMenu', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  it('메뉴 버튼을 누르면 메뉴를 열고 지금 페이지를 표시한다', async () => {
    const { open } = renderOpenMenu()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await open()

    expect(screen.getByRole('dialog', { name: '메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '받은 요청' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('메뉴 항목을 누르면 이동하면서 닫는다', async () => {
    const { user, open } = renderOpenMenu()
    await open()

    const link = screen.getByRole('link', { name: '내 견적 관리' })
    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('메뉴 바깥은 누르면 닫고, 안쪽은 눌러도 닫지 않는다', async () => {
    const { user, open } = renderOpenMenu()
    await open()

    await user.click(screen.getByRole('list'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('dialog'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
