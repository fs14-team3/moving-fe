import { act, render, screen } from '@testing-library/react'
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

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김기사',
    email: 'mover@example.com',
    phone: '01012345678',
    hasProfile: true,
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
    router.push.mockClear()
    currentUser.user = createUser('MOVER')
  })

  it('현재 기본정보를 채우고 비밀번호는 비워 둔다', () => {
    const { fields, submit } = renderBasicInfoForm()

    expect(fields.name).toHaveValue('김기사')
    expect(fields.email).toHaveValue('mover@example.com')
    expect(fields.phone).toHaveValue('01012345678')
    expect(fields.currentPassword).toHaveValue('')
    expect(fields.newPassword).toHaveValue('')
    expect(fields.newPasswordConfirm).toHaveValue('')
    expect(submit).toBeDisabled()
  })

  it('회원가입과 같은 기준으로 검사하고 전화번호는 숫자만 남긴다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()

    await user.clear(fields.email)
    await user.type(fields.email, 'mover@')
    await user.tab()
    await user.clear(fields.phone)
    await user.type(fields.phone, '010-9876-5432')

    expect(fields.email).toHaveAccessibleDescription(
      '올바른 이메일 형식이 아닙니다.',
    )
    expect(fields.phone).toHaveValue('01098765432')
    expect(submit).toBeDisabled()
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

  it('다시 불러온 정보는 고치지 않은 입력란에 반영하고 보내지 않는다', async () => {
    const { user, rerender, fields, submit } = renderBasicInfoForm()
    await user.clear(fields.phone)
    await user.type(fields.phone, '01098765432')

    currentUser.user = { ...createUser('MOVER'), name: '김코드' }
    rerender()

    expect(fields.name).toHaveValue('김코드')
    expect(fields.phone).toHaveValue('01098765432')

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

    expect(updateBasicInfoState.mutate).toHaveBeenCalledWith(
      { currentPassword: 'oldpass1!', newPassword: 'newpass1!' },
      expect.anything(),
    )
  })

  it('새 비밀번호가 규칙에 맞지 않으면 안내한다', async () => {
    const { user, fields } = renderBasicInfoForm()

    await user.type(fields.newPassword, 'short')
    await user.tab()

    expect(fields.newPassword).toHaveAccessibleDescription(
      '영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.',
    )
  })

  it('서버가 알려 준 오류를 보여 주고 고치면 지운다', async () => {
    const { user, fields, submit } = renderBasicInfoForm()
    await user.type(fields.currentPassword, 'wrongpass1!')
    await user.type(fields.newPassword, 'newpass1!')
    await user.type(fields.newPasswordConfirm, 'newpass1!')

    act(() =>
      updateBasicInfoState.onFieldErrors({
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

  it('수정 중에는 입력란과 버튼을 모두 잠근다', () => {
    updateBasicInfoState.isPending = true
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
