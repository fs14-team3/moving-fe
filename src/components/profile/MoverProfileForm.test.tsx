import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoverProfileForm from '@/components/profile/MoverProfileForm'
import type { Role } from '@/features/auth/types'
import type { ProfileFieldErrors } from '@/features/profile/types'

const createProfileState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  onFieldErrors: (() => {}) as (errors: ProfileFieldErrors) => void,
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

function renderMoverProfileForm() {
  const user = userEvent.setup()
  render(<MoverProfileForm />)

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
    fields,
    fillValidForm,
    services: screen.getByRole('group', { name: '제공 서비스(필수)' }),
    regions: screen.getByRole('group', { name: '서비스 가능 지역(필수)' }),
    submit: screen.getByRole('button', { name: '시작하기' }),
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
