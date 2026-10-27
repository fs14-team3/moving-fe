import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomerProfileForm from '@/components/profile/CustomerProfileForm'
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

function renderCustomerProfileForm() {
  const user = userEvent.setup()
  render(<CustomerProfileForm />)

  return {
    user,
    services: screen.getByRole('group', { name: '이용 서비스' }),
    regions: screen.getByRole('group', { name: '내가 사는 지역' }),
    submit: screen.getByRole('button', { name: '시작하기' }),
  }
}

describe('CustomerProfileForm', () => {
  beforeEach(() => {
    createProfileState.mutate.mockClear()
    createProfileState.isPending = false
    createProfileState.isSuccess = false
  })

  it('서비스와 지역을 하나 이상 골라야 시작할 수 있다', async () => {
    const { user, submit } = renderCustomerProfileForm()
    expect(submit).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '소형이사' }))
    expect(submit).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '서울' }))
    expect(submit).toBeEnabled()
  })

  it('누른 칩의 선택 상태를 바꾼다', async () => {
    const { user } = renderCustomerProfileForm()
    const chip = screen.getByRole('button', { name: '가정이사' })

    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')

    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('서비스는 여러 개를 선택지 순서대로, 지역은 마지막에 고른 하나를 등록한다', async () => {
    const { user, submit } = renderCustomerProfileForm()

    await user.click(screen.getByRole('button', { name: '사무실이사' }))
    await user.click(screen.getByRole('button', { name: '소형이사' }))
    await user.click(screen.getByRole('button', { name: '부산' }))
    await user.click(screen.getByRole('button', { name: '서울' }))
    await user.click(submit)

    expect(screen.getByRole('button', { name: '부산' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(createProfileState.mutate).toHaveBeenCalledWith({
      serviceTypes: ['SMALL', 'OFFICE'],
      regions: ['서울'],
    })
  })

  it('고른 지역을 다시 눌러도 선택을 유지한다', async () => {
    const { user, submit } = renderCustomerProfileForm()
    await user.click(screen.getByRole('button', { name: '소형이사' }))
    const region = screen.getByRole('button', { name: '서울' })

    await user.click(region)
    await user.click(region)

    expect(region).toHaveAttribute('aria-pressed', 'true')
    expect(submit).toBeEnabled()
  })

  it('선택을 모두 해제하면 안내 문구 대신 오류를 보여 준다', async () => {
    const { user, services } = renderCustomerProfileForm()
    expect(services).toHaveAccessibleDescription(
      '*이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!',
    )

    const chip = screen.getByRole('button', { name: '소형이사' })
    await user.click(chip)
    await user.click(chip)

    expect(services).toHaveAccessibleDescription('1개 이상 선택해 주세요.')
  })

  it('서버가 알려 준 오류를 보여 주고 다시 고르면 지운다', async () => {
    const { user, regions, submit } = renderCustomerProfileForm()
    await user.click(screen.getByRole('button', { name: '소형이사' }))
    await user.click(screen.getByRole('button', { name: '서울' }))

    act(() =>
      createProfileState.onFieldErrors({
        regions: '지역을 다시 선택해 주세요.',
      }),
    )

    expect(regions).toHaveAccessibleDescription('지역을 다시 선택해 주세요.')
    expect(submit).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '부산' }))

    expect(regions).toHaveAccessibleDescription(
      '*내가 사는 지역은 언제든 수정 가능해요!',
    )
    expect(submit).toBeEnabled()
  })

  it('등록 중에는 칩과 버튼을 모두 잠근다', () => {
    createProfileState.isPending = true
    const { services, regions, submit } = renderCustomerProfileForm()

    for (const chip of [
      ...services.querySelectorAll('button'),
      ...regions.querySelectorAll('button'),
    ]) {
      expect(chip).toBeDisabled()
    }
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })
})
