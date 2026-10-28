import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoverProfileForm from '@/components/profile/MoverProfileForm'
import type { Me, Role } from '@/features/auth/types'
import type {
  ProfileFieldErrors,
  ProfileFormMode,
} from '@/features/profile/types'

const createProfileState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  onFieldErrors: (() => {}) as (errors: ProfileFieldErrors) => void,
}))

const updateProfileState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
}))

const currentUser = vi.hoisted(() => ({ user: null as Me | null }))

const router = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => currentUser,
}))

vi.mock('@/features/profile/hooks/useCreateProfile', () => ({
  useCreateProfile: (
    _role: Role,
    onFieldErrors: (errors: ProfileFieldErrors) => void,
  ) => {
    createProfileState.onFieldErrors = onFieldErrors
    return createProfileState
  },
}))

vi.mock('@/features/profile/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => updateProfileState,
}))

const savedProfile = {
  imageUrl: null,
  nickname: '김코드',
  careerYears: 8,
  intro: '꼼꼼한 이사를 도와드립니다.',
  description: '고객님의 물품을 안전하게 옮겨 드립니다.',
  serviceTypes: ['SMALL' as const],
  regions: ['서울', '경기'],
}

function createMover(profile: Me['moverProfile']): Me {
  return {
    id: 'user-1',
    role: 'MOVER',
    name: '김기사',
    email: 'mover@example.com',
    phone: '01012345678',
    hasProfile: true,
    customerProfile: null,
    moverProfile: profile,
  }
}

function renderMoverProfileForm(mode: ProfileFormMode = 'register') {
  const user = userEvent.setup()
  const { rerender } = render(<MoverProfileForm mode={mode} />)

  const fields = {
    nickname: screen.getByRole('textbox', { name: '별명' }),
    careerYears: screen.getByRole('textbox', { name: '경력' }),
    intro: screen.getByRole('textbox', { name: '한 줄 소개' }),
    description: screen.getByRole('textbox', { name: '상세 설명' }),
  }

  const fillValidForm = async () => {
    await user.type(fields.nickname, ' 김코드 ')
    await user.type(fields.careerYears, '8')
    await user.type(fields.intro, '꼼꼼한 이사를 도와드립니다.')
    await user.type(
      fields.description,
      '고객님의 물품을 안전하게 옮겨 드립니다.',
    )
    await user.click(screen.getByRole('button', { name: '가정이사' }))
    await user.click(screen.getByRole('button', { name: '경기' }))
    await user.click(screen.getByRole('button', { name: '서울' }))
  }

  return {
    user,
    rerender: () => rerender(<MoverProfileForm mode={mode} />),
    fields,
    fillValidForm,
    services: screen.getByRole('group', { name: '제공 서비스(필수)' }),
    regions: screen.getByRole('group', { name: '서비스 가능 지역(필수)' }),
    submit: screen.getByRole('button', {
      name: mode === 'edit' ? '수정하기' : '시작하기',
    }),
  }
}

describe('MoverProfileForm', () => {
  beforeEach(() => {
    createProfileState.mutate.mockClear()
    createProfileState.isPending = false
    createProfileState.isSuccess = false
  })

  it('입력란을 벗어난 뒤에만 오류를 보여 준다', async () => {
    const { user, fields } = renderMoverProfileForm()

    await user.type(fields.careerYears, '10년')
    expect(fields.careerYears).not.toHaveAttribute('aria-invalid')

    await user.tab()
    expect(fields.careerYears).toHaveAttribute('aria-invalid', 'true')
    expect(fields.careerYears).toHaveAccessibleDescription(
      '숫자만 입력해 주세요.',
    )
  })

  it.each<['nickname' | 'intro' | 'description', string, string]>([
    ['nickname', ' ', '별명을 입력해 주세요.'],
    ['intro', '안녕하세요.', '8자 이상 입력해 주세요.'],
    ['description', '  후기  ', '10자 이상 입력해 주세요.'],
  ])(
    '%s 입력란에 %j를 입력하면 "%s"를 안내한다',
    async (field, text, message) => {
      const { user, fields } = renderMoverProfileForm()

      await user.type(fields[field], text)
      await user.tab()

      expect(fields[field]).toHaveAccessibleDescription(message)
    },
  )

  it('필수 항목을 모두 입력하면 앞뒤 공백을 뺀 값으로 등록한다', async () => {
    const { user, fillValidForm, submit } = renderMoverProfileForm()
    expect(submit).toBeDisabled()

    await fillValidForm()
    await user.click(submit)

    expect(createProfileState.mutate).toHaveBeenCalledWith({
      nickname: '김코드',
      careerYears: 8,
      intro: '꼼꼼한 이사를 도와드립니다.',
      description: '고객님의 물품을 안전하게 옮겨 드립니다.',
      serviceTypes: ['HOME'],
      regions: ['서울', '경기'],
    })
  })

  it('서비스나 지역을 모두 해제하면 오류를 보여 주고 등록할 수 없다', async () => {
    const { user, fillValidForm, services, submit } = renderMoverProfileForm()
    await fillValidForm()
    expect(submit).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '가정이사' }))

    expect(services).toHaveAccessibleDescription('1개 이상 선택해 주세요.')
    expect(submit).toBeDisabled()
  })

  it('서버가 알려 준 오류를 보여 주고 고치면 지운다', async () => {
    const { user, fields, fillValidForm, submit } = renderMoverProfileForm()
    await fillValidForm()

    act(() =>
      createProfileState.onFieldErrors({
        nickname: '별명을 다시 확인해 주세요.',
      }),
    )

    expect(fields.nickname).toHaveAccessibleDescription(
      '별명을 다시 확인해 주세요.',
    )
    expect(submit).toBeDisabled()

    await user.type(fields.nickname, '2')

    expect(fields.nickname).not.toHaveAttribute('aria-invalid')
    expect(submit).toBeEnabled()
  })

  it('등록 중에는 입력란 · 칩 · 버튼을 모두 잠근다', () => {
    createProfileState.isPending = true
    const { fields, services, regions, submit } = renderMoverProfileForm()

    for (const control of [
      ...Object.values(fields),
      ...services.querySelectorAll('button'),
      ...regions.querySelectorAll('button'),
    ]) {
      expect(control).toBeDisabled()
    }
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })
})

describe('MoverProfileForm 수정', () => {
  beforeEach(() => {
    updateProfileState.mutate.mockClear()
    updateProfileState.isPending = false
    router.push.mockClear()
    currentUser.user = createMover(savedProfile)
  })

  it('등록한 프로필을 채운다', () => {
    const { fields } = renderMoverProfileForm('edit')

    expect(fields.nickname).toHaveValue('김코드')
    expect(fields.careerYears).toHaveValue('8')
    expect(fields.intro).toHaveValue('꼼꼼한 이사를 도와드립니다.')
    expect(fields.description).toHaveValue(
      '고객님의 물품을 안전하게 옮겨 드립니다.',
    )
    for (const name of ['소형이사', '서울', '경기']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
  })

  it('앞뒤 공백만 더하면 바뀐 항목으로 보지 않는다', async () => {
    const { user, fields, submit } = renderMoverProfileForm('edit')
    expect(submit).toBeDisabled()

    await user.type(fields.nickname, ' ')
    expect(submit).toBeDisabled()

    await user.type(fields.nickname, '2')
    expect(submit).toBeEnabled()
  })

  it('바꾼 항목만 수정하고 성공하면 마이페이지로 이동한다', async () => {
    const { user, fields, submit } = renderMoverProfileForm('edit')

    await user.clear(fields.careerYears)
    await user.type(fields.careerYears, '9')
    await user.click(screen.getByRole('button', { name: '인천' }))
    await user.click(submit)

    expect(updateProfileState.mutate).toHaveBeenCalledWith(
      { careerYears: 9, regions: ['서울', '경기', '인천'] },
      expect.anything(),
    )
    expect(router.push).not.toHaveBeenCalled()

    act(() => updateProfileState.mutate.mock.calls[0][1].onSuccess())

    expect(router.push).toHaveBeenCalledWith('/mover/mypage')
  })

  it('다시 불러온 프로필은 고치지 않은 항목에 반영하고 보내지 않는다', async () => {
    const { user, rerender, fields, submit } = renderMoverProfileForm('edit')
    await user.clear(fields.careerYears)
    await user.type(fields.careerYears, '9')

    currentUser.user = createMover({
      ...savedProfile,
      nickname: '김무빙',
      regions: ['부산'],
    })
    rerender()

    expect(fields.nickname).toHaveValue('김무빙')
    expect(fields.careerYears).toHaveValue('9')
    expect(screen.getByRole('button', { name: '부산' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(submit)

    expect(updateProfileState.mutate).toHaveBeenCalledWith(
      { careerYears: 9 },
      expect.anything(),
    )
  })

  it('취소하면 수정하지 않고 마이페이지로 돌아간다', async () => {
    const { user } = renderMoverProfileForm('edit')

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(router.push).toHaveBeenCalledWith('/mover/mypage')
    expect(updateProfileState.mutate).not.toHaveBeenCalled()
  })

  it('수정 중에는 입력란과 버튼을 모두 잠근다', () => {
    updateProfileState.isPending = true
    const { fields, submit } = renderMoverProfileForm('edit')

    for (const field of Object.values(fields)) {
      expect(field).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })
})
