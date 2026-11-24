import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import RejectModal from '@/components/common/modal/RejectModal'

describe('RejectModal', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  it('공백을 뺀 글자 수를 보여 주고 최소 글자 수를 채우면 반려할 수 있다', async () => {
    const user = userEvent.setup()
    render(
      <RejectModal
        open
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        request={{
          moveType: 'SMALL',
          name: '김고객 고객님',
          from: '서울시 중구',
          to: '경기도 수원시',
          movingDate: '2026년 12월 01일 (화)',
        }}
      />,
    )
    const reason = screen.getByLabelText('반려 사유를 입력해 주세요')
    const submit = screen.getByRole('button', { name: '반려하기' })

    await user.type(reason, '이사 일정이 맞지 않아')
    expect(reason).toHaveAccessibleDescription('9 / 최소 10자')
    expect(submit).toBeDisabled()

    await user.type(reason, '.')
    expect(reason).toHaveAccessibleDescription('10 / 최소 10자')
    expect(submit).toBeEnabled()
  })
})
