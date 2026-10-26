import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginForm from '@/components/auth/LoginForm'
import type { Role } from '@/features/auth/types'

const loginState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
}))

vi.mock('@/features/auth/hooks/useLogin', () => ({
  useLogin: () => loginState,
}))

function renderLoginForm(role: Role = 'CUSTOMER') {
  const user = userEvent.setup()
  render(<LoginForm role={role} />)
  return {
    user,
    email: screen.getByLabelText('이메일'),
    password: screen.getByLabelText('비밀번호'),
    submit: screen.getByRole('button', { name: '로그인' }),
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    loginState.mutate.mockClear()
    loginState.isPending = false
    loginState.isSuccess = false
  })

  it('이메일과 비밀번호를 올바르게 입력해야 로그인 버튼이 활성화된다', async () => {
    const { user, email, password, submit } = renderLoginForm()
    expect(submit).toBeDisabled()

    await user.type(email, 'customer@example.com')
    expect(submit).toBeDisabled()

    await user.type(password, 'password1!')
    expect(submit).toBeEnabled()
  })

  it('입력란을 벗어난 뒤에만 오류를 보여 준다', async () => {
    const { user, email } = renderLoginForm()

    await user.type(email, 'customer')
    expect(email).not.toHaveAttribute('aria-invalid')

    await user.tab()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('올바른 이메일 형식이 아닙니다.')
  })

  it('앞뒤 공백을 뺀 이메일과 유저 타입으로 로그인한다', async () => {
    const { user, email, password, submit } = renderLoginForm('MOVER')

    await user.type(email, '  mover@example.com ')
    await user.type(password, 'password1!')
    await user.click(submit)

    expect(loginState.mutate).toHaveBeenCalledWith({
      role: 'MOVER',
      email: 'mover@example.com',
      password: 'password1!',
    })
  })

  it.each([
    ['로그인 중', { isPending: true }],
    ['로그인 후 이동 중', { isSuccess: true }],
  ])('%s에는 다시 제출할 수 없다', async (_, state) => {
    Object.assign(loginState, state)
    const { user, email, password, submit } = renderLoginForm()

    await user.type(email, 'customer@example.com')
    await user.type(password, 'password1!')

    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })

  it('비밀번호 보기 버튼으로 비밀번호를 보이거나 숨긴다', async () => {
    const { user, password } = renderLoginForm()
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: '비밀번호 보기' }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: '비밀번호 숨기기' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it.each<[Role, string, string]>([
    ['CUSTOMER', '/mover/login', '/signup'],
    ['MOVER', '/login', '/mover/signup'],
  ])(
    '%s 로그인에서는 다른 유저 타입 로그인(%s)과 회원가입(%s)으로 안내한다',
    (role, otherLoginPath, signupPath) => {
      renderLoginForm(role)

      expect(screen.getByRole('link', { name: /전용 페이지/ })).toHaveAttribute(
        'href',
        otherLoginPath,
      )
      expect(
        screen.getByRole('link', { name: '이메일로 회원가입하기' }),
      ).toHaveAttribute('href', signupPath)
    },
  )
})
