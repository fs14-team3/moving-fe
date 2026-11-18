import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BasicInfoForm from '@/components/profile/BasicInfoForm'
import type { Me, Role } from '@/features/auth/types'
import type { BasicInfoFieldErrors } from '@/features/profile/types'

const updateBasicInfoState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  onFieldErrors: (() => {}) as (errors: BasicInfoFieldErrors) => void,
}))

const changePasswordState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  onFieldErrors: (() => {}) as (errors: { currentPassword: string }) => void,
}))

const currentUser = vi.hoisted(() => ({ user: null as Me | null }))

const router = vi.hoisted(() => ({ push: vi.fn(), back: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => currentUser,
}))

vi.mock('@/features/profile/hooks/useUpdateBasicInfo', () => ({
  useUpdateBasicInfo: (
    onFieldErrors: (errors: BasicInfoFieldErrors) => void,
  ) => {
    updateBasicInfoState.onFieldErrors = onFieldErrors
    return updateBasicInfoState
  },
}))

vi.mock('@/features/profile/hooks/useChangePassword', () => ({
  useChangePassword: (
    onFieldErrors: (errors: { currentPassword: string }) => void,
  ) => {
    changePasswordState.onFieldErrors = onFieldErrors
    return changePasswordState
  },
}))

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김기사',
    email: 'mover@example.com',
    phone: '01012345678',
    hasProfile: true,
    isProfileComplete: true,
    customerProfile: null,
    moverProfile: null,
  }
}

function renderBasicInfoForm(role: Role = 'MOVER') {
  const user = userEvent.setup()
  const { rerender } = render(<BasicInfoForm role={role} />)

  return {
    user,
    rerender: () => rerender(<BasicInfoForm role={role} />),
    fields: {
      name: screen.getByLabelText('이름'),
      email: screen.getByLabelText('이메일'),
      phone: screen.getByLabelText('전화번호'),
      currentPassword: screen.getByLabelText('현재 비밀번호'),
      newPassword: screen.getByLabelText('새 비밀번호'),
      newPasswordConfirm: screen.getByLabelText('새 비밀번호 확인'),
    },
    submit: screen.getByRole('button', { name: '수정하기' }),
  }
}

describe('BasicInfoForm', () => {
  beforeEach(() => {
    updateBasicInfoState.mutate.mockClear()
    updateBasicInfoState.isPending = false
    changePasswordState.mutate.mockClear()
    changePasswordState.isPending = false
    router.push.mockClear()
    currentUser.user = createUser('MOVER')
  })

  it('현재 기본정보를 채우고 비밀번호는 비워 둔다', () => {
    const { fields, submit } = renderBasicInfoForm()

    expect(fields.name).toHaveValue('김기사')
    expect(fields.email).toHaveValue('mover@example.com')
    expect(fields.phone).toHaveValue('010-1234-5678')
    expect(fields.currentPassword).toHaveValue('')
    expect(fields.newPassword).toHaveValue('')
    expect(fields.newPasswordConfirm).toHaveValue('')
    expect(submit).toBeDisabled()
  })

  it('회원가입과 같은 기준으로 검사하고 전화번호는 하이픈을 넣어 보여 준다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()

    await user.clear(fields.email)
    await user.type(fields.email, 'mover@')
    await user.tab()
    await user.clear(fields.phone)
    await user.type(fields.phone, '010-9876-5432')

    expect(fields.email).toHaveAccessibleDescription(
      '올바른 이메일 형식이 아닙니다.',
    )
    expect(fields.phone).toHaveValue('010-9876-5432')
    expect(submit).toBeDisabled()
  })

  it('전화번호 하이픈 뒤에서 지우면 커서가 하이픈 앞으로 이동한다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.type(fields.phone, '{Backspace}', {
      initialSelectionStart: 9,
      initialSelectionEnd: 9,
    })

    expect(fields.phone).toHaveValue('010-1234-5678')
    await waitFor(() =>
      expect(fields.phone).toHaveProperty('selectionStart', 8),
    )
  })

  it('전화번호 하이픈 앞에서 앞으로 지우면 하이픈을 건너 다음 숫자를 지운다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.type(fields.phone, '{Delete}', {
      initialSelectionStart: 3,
      initialSelectionEnd: 3,
    })
    await waitFor(() =>
      expect(fields.phone).toHaveProperty('selectionStart', 4),
    )
    await user.keyboard('{Delete}')

    expect(fields.phone).toHaveValue('010-234-5678')
  })

  it('전화번호 11자리가 모두 차면 숫자를 더 넣을 수 없다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.type(fields.phone, '9', {
      initialSelectionStart: 6,
      initialSelectionEnd: 6,
    })

    expect(fields.phone).toHaveValue('010-1234-5678')
  })

  it('괄호나 공백이 섞인 전화번호를 붙여 넣어도 숫자를 모두 받는다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.clear(fields.phone)
    await user.paste('(010) 9876-5432')

    expect(fields.phone).toHaveValue('010-9876-5432')
  })

  it('바뀐 항목만 앞뒤 공백을 빼고 보낸다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()

    await user.type(fields.name, ' ')
    expect(submit).toBeDisabled()

    await user.clear(fields.name)
    await user.type(fields.name, ' 김코드 ')
    await user.click(submit)

    expect(updateBasicInfoState.mutate).toHaveBeenCalledWith(
      { name: '김코드' },
      expect.anything(),
    )
  })

  it('저장된 값이 규칙에 맞지 않아도 바꾼 입력란만 검사해 보낸다', async () => {
    currentUser.user = { ...createUser('MOVER'), name: 'A', phone: null }
    const { user, fields, submit } = renderBasicInfoForm()

    await user.clear(fields.email)
    await user.type(fields.email, 'new@example.com')
    await user.click(submit)

    expect(updateBasicInfoState.mutate).toHaveBeenCalledWith(
      { email: 'new@example.com' },
      expect.anything(),
    )
  })

  it('다시 불러온 정보는 고치지 않은 입력란에 반영하고 보내지 않는다', async () => {
    const { user, rerender, fields, submit } = renderBasicInfoForm()
    await user.clear(fields.phone)
    await user.type(fields.phone, '01098765432')

    currentUser.user = { ...createUser('MOVER'), name: '김코드' }
    rerender()

    expect(fields.name).toHaveValue('김코드')
    expect(fields.phone).toHaveValue('010-9876-5432')

    await user.click(submit)

    expect(updateBasicInfoState.mutate).toHaveBeenCalledWith(
      { phone: '01098765432' },
      expect.anything(),
    )
  })

  it('비밀번호를 바꾸려면 세 입력란을 모두 채워야 한다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()

    await user.type(fields.newPassword, 'newpass1!')
    await user.tab()
    await user.type(fields.newPasswordConfirm, 'newpass2!')
    await user.tab()
    await user.click(fields.currentPassword)
    await user.tab()

    expect(fields.currentPassword).toHaveAccessibleDescription(
      '비밀번호를 입력해 주세요.',
    )
    expect(fields.newPasswordConfirm).toHaveAccessibleDescription(
      '비밀번호가 일치하지 않습니다.',
    )
    expect(submit).toBeDisabled()

    await user.type(fields.currentPassword, 'oldpass1!')
    await user.clear(fields.newPasswordConfirm)
    await user.type(fields.newPasswordConfirm, 'newpass1!')
    await user.click(submit)

    expect(changePasswordState.mutate).toHaveBeenCalledWith(
      {
        currentPassword: 'oldpass1!',
        newPassword: 'newpass1!',
        confirmPassword: 'newpass1!',
      },
      expect.anything(),
    )
    expect(updateBasicInfoState.mutate).not.toHaveBeenCalled()
  })

  it('새 비밀번호가 규칙에 맞지 않으면 안내한다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.type(fields.newPassword, 'short')
    await user.tab()

    expect(fields.newPassword).toHaveAccessibleDescription(
      '공백 없이 영문, 숫자, 특수문자를 포함해 8~16자로 입력해 주세요.',
    )
  })

  it('새 비밀번호가 현재 비밀번호와 같으면 안내한다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()

    await user.type(fields.currentPassword, 'samepass1!')
    await user.type(fields.newPassword, 'samepass1!')
    await user.tab()
    await user.type(fields.newPasswordConfirm, 'samepass1!')

    expect(fields.newPassword).toHaveAccessibleDescription(
      '현재 비밀번호와 다른 비밀번호를 입력해 주세요.',
    )
    expect(submit).toBeDisabled()
  })

  it('기본정보를 먼저 저장한 뒤 비밀번호를 바꾸고 마이페이지로 이동한다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()
    await user.type(fields.name, '님')
    await user.type(fields.currentPassword, 'oldpass1!')
    await user.type(fields.newPassword, 'newpass1!')
    await user.type(fields.newPasswordConfirm, 'newpass1!')
    await user.click(submit)

    expect(updateBasicInfoState.mutate).toHaveBeenCalledWith(
      { name: '김기사님' },
      expect.anything(),
    )
    expect(changePasswordState.mutate).not.toHaveBeenCalled()

    act(() => updateBasicInfoState.mutate.mock.calls[0][1].onSuccess())

    expect(changePasswordState.mutate).toHaveBeenCalledWith(
      {
        currentPassword: 'oldpass1!',
        newPassword: 'newpass1!',
        confirmPassword: 'newpass1!',
      },
      expect.anything(),
    )
    expect(router.push).not.toHaveBeenCalled()

    act(() => changePasswordState.mutate.mock.calls[0][1].onSuccess())

    expect(router.push).toHaveBeenCalledWith('/mover/mypage')
  })

  it('서버가 알려 준 오류를 보여 주고 고치면 지운다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()
    await user.type(fields.currentPassword, 'wrongpass1!')
    await user.type(fields.newPassword, 'newpass1!')
    await user.type(fields.newPasswordConfirm, 'newpass1!')

    act(() =>
      changePasswordState.onFieldErrors({
        currentPassword: '현재 비밀번호를 다시 확인해 주세요.',
      }),
    )

    expect(fields.currentPassword).toHaveAccessibleDescription(
      '현재 비밀번호를 다시 확인해 주세요.',
    )
    expect(submit).toBeDisabled()

    await user.type(fields.currentPassword, '2')

    expect(fields.currentPassword).not.toHaveAttribute('aria-invalid')
    expect(submit).toBeEnabled()
  })

  it('수정에 성공하면 마이페이지로 이동한다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()
    await user.type(fields.name, '님')
    await user.click(submit)

    expect(router.push).not.toHaveBeenCalled()

    act(() => updateBasicInfoState.mutate.mock.calls[0][1].onSuccess())

    expect(router.push).toHaveBeenCalledWith('/mover/mypage')
  })

  it('취소하면 수정하지 않고 마이페이지로 돌아간다', async () => {
    const { user } = renderBasicInfoForm()

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(router.push).toHaveBeenCalledWith('/mover/mypage')
    expect(updateBasicInfoState.mutate).not.toHaveBeenCalled()
  })

  it.each([
    ['기본정보', updateBasicInfoState],
    ['비밀번호', changePasswordState],
  ])('%s 수정 중에는 입력란과 버튼을 모두 잠근다', (_name, state) => {
    state.isPending = true
    const { fields, submit } = renderBasicInfoForm()

    for (const field of Object.values(fields)) {
      expect(field).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })
})

describe('BasicInfoForm 일반 유저', () => {
  beforeEach(() => {
    updateBasicInfoState.mutate.mockClear()
    updateBasicInfoState.isPending = false
    changePasswordState.mutate.mockClear()
    changePasswordState.isPending = false
    router.push.mockClear()
    router.back.mockClear()
    currentUser.user = createUser('CUSTOMER')
  })

  it('수정에 성공하면 페이지에 머물고 저장된 정보로 입력란을 되돌린다', async () => {
    const { user, fields, submit } = renderBasicInfoForm('CUSTOMER')
    await user.type(fields.name, '님')
    await user.type(fields.currentPassword, 'oldpass1!')
    await user.type(fields.newPassword, 'newpass1!')
    await user.type(fields.newPasswordConfirm, 'newpass1!')
    await user.click(submit)

    currentUser.user = { ...createUser('CUSTOMER'), name: '김기사님' }
    act(() => updateBasicInfoState.mutate.mock.calls[0][1].onSuccess())
    act(() => changePasswordState.mutate.mock.calls[0][1].onSuccess())

    expect(router.push).not.toHaveBeenCalled()
    expect(fields.name).toHaveValue('김기사님')
    expect(fields.currentPassword).toHaveValue('')
    expect(fields.newPassword).toHaveValue('')
    expect(fields.newPasswordConfirm).toHaveValue('')
    expect(submit).toBeDisabled()
  })

  it('취소하면 수정하지 않고 이전 페이지로 돌아간다', async () => {
    const { user } = renderBasicInfoForm('CUSTOMER')

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(router.back).toHaveBeenCalled()
    expect(updateBasicInfoState.mutate).not.toHaveBeenCalled()
  })
})
