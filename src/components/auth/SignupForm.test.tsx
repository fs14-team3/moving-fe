import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupForm from '@/components/auth/SignupForm'
import type { Role } from '@/features/auth/types'
import type { SignupFieldErrors } from '@/features/auth/hooks/useSignup'

const signupState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  onFieldErrors: (() => {}) as (errors: SignupFieldErrors) => void,
}))

vi.mock('@/features/auth/hooks/useSignup', () => ({
  useSignup: (onFieldErrors: (errors: SignupFieldErrors) => void) => {
    signupState.onFieldErrors = onFieldErrors
    return signupState
  },
}))

function renderSignupForm(role: Role = 'CUSTOMER') {
  const user = userEvent.setup()
  render(<SignupForm role={role} />)

  const fields = {
    name: screen.getByLabelText('이름'),
    email: screen.getByLabelText('이메일'),
    phone: screen.getByLabelText('전화번호'),
    password: screen.getByLabelText('비밀번호'),
    passwordConfirm: screen.getByLabelText('비밀번호 확인'),
  }

  const fillValidForm = async () => {
    await user.type(fields.name, ' 김고객 ')
    await user.type(fields.email, ' customer@example.com ')
    await user.type(fields.phone, '010-1234-5678')
    await user.type(fields.password, 'moving1!')
    await user.type(fields.passwordConfirm, 'moving1!')
  }

  return {
    user,
    fields,
    fillValidForm,
    submit: screen.getByRole('button', { name: '시작하기' }),
  }
}

describe('SignupForm', () => {
  beforeEach(() => {
    signupState.mutate.mockClear()
    signupState.isPending = false
    signupState.isSuccess = false
  })

  it('전화번호는 숫자만 11자리까지 받는다', async () => {
    const { user, fields } = renderSignupForm()

    await user.type(fields.phone, '010-1234-56789')

    expect(fields.phone).toHaveValue('01012345678')
  })

  it('입력란을 벗어난 뒤에만 오류를 보여 준다', async () => {
    const { user, fields } = renderSignupForm()

    await user.type(fields.email, 'customer')
    expect(fields.email).not.toHaveAttribute('aria-invalid')

    await user.tab()
    expect(fields.email).toHaveAttribute('aria-invalid', 'true')
    expect(fields.email).toHaveAccessibleDescription(
      '올바른 이메일 형식이 아닙니다.',
    )
  })

  it('모두 올바르게 입력하면 앞뒤 공백을 뺀 값과 유저 타입으로 가입한다', async () => {
    const { user, fillValidForm, submit } = renderSignupForm('MOVER')

    await fillValidForm()
    await user.click(submit)

    expect(signupState.mutate).toHaveBeenCalledWith({
      role: 'MOVER',
      name: '김고객',
      email: 'customer@example.com',
      phone: '01012345678',
      password: 'moving1!',
    })
  })

  it('비밀번호 확인이 다르면 알리고 가입할 수 없다', async () => {
    const { user, fields, fillValidForm, submit } = renderSignupForm()
    await fillValidForm()

    await user.type(fields.passwordConfirm, '?')
    await user.tab()

    expect(fields.passwordConfirm).toHaveAccessibleDescription(
      '비밀번호가 일치하지 않습니다.',
    )
    expect(submit).toBeDisabled()
  })

  it('서버가 알려 준 오류는 해당 입력란을 고칠 때까지 보여 준다', async () => {
    const { user, fields, fillValidForm, submit } = renderSignupForm()
    await fillValidForm()

    act(() => signupState.onFieldErrors({ email: '이미 가입된 이메일입니다.' }))

    expect(fields.email).toHaveAccessibleDescription(
      '이미 가입된 이메일입니다.',
    )
    expect(submit).toBeDisabled()

    await user.clear(fields.email)
    await user.type(fields.email, 'new@example.com')

    expect(fields.email).not.toHaveAttribute('aria-invalid')
    expect(submit).toBeEnabled()
  })

  it('가입 중에는 입력란과 버튼을 모두 잠근다', () => {
    signupState.isPending = true
    const { fields, submit } = renderSignupForm()

    for (const field of Object.values(fields)) {
      expect(field).toBeDisabled()
    }
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })

  it.each<[Role, string]>([
    ['CUSTOMER', '/login'],
    ['MOVER', '/mover/login'],
  ])('%s 회원가입에서는 %s 로그인으로 안내한다', (role, loginPath) => {
    renderSignupForm(role)

    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute(
      'href',
      loginPath,
    )
  })
})
