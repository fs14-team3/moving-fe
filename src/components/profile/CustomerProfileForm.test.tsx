import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomerProfileForm from '@/components/profile/CustomerProfileForm'
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

const router = vi.hoisted(() => ({ back: vi.fn() }))

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

function createCustomer(profile: Me['customerProfile']): Me {
  return {
    id: 'user-1',
    role: 'CUSTOMER',
    name: '김가나',
    email: 'user@example.com',
    phone: '01012345678',
    hasProfile: true,
    customerProfile: profile,
    moverProfile: null,
  }
}

function renderCustomerProfileForm(mode: ProfileFormMode = 'register') {
  const user = userEvent.setup()
  const { rerender } = render(<CustomerProfileForm mode={mode} />)

  return {
    user,
    rerender: () => rerender(<CustomerProfileForm mode={mode} />),
    services: screen.getByRole('group', { name: '이용 서비스' }),
    regions: screen.getByRole('group', { name: '내가 사는 지역' }),
    submit: screen.getByRole('button', {
      name: mode === 'edit' ? '수정하기' : '시작하기',
    }),
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

describe('CustomerProfileForm 수정', () => {
  beforeEach(() => {
    updateProfileState.mutate.mockClear()
    updateProfileState.isPending = false
    updateProfileState.isSuccess = false
    router.back.mockClear()
    currentUser.user = createCustomer({
      serviceTypes: ['HOME', 'SMALL'],
      regions: ['서울'],
    })
  })

  it('등록한 프로필을 채우고 수정 안내 문구를 보여 준다', () => {
    const { services, regions } = renderCustomerProfileForm('edit')

    for (const name of ['소형이사', '가정이사', '서울']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
    expect(services).toHaveAccessibleDescription(
      '*견적 요청 시 이용 서비스를 선택할 수 있어요.',
    )
    expect(regions).toHaveAccessibleDescription(
      '*견적 요청 시 지역을 설정할 수 있어요.',
    )
  })

  it('바뀐 항목이 없으면 수정할 수 없다', async () => {
    const { user, submit } = renderCustomerProfileForm('edit')
    expect(submit).toBeDisabled()

    const chip = screen.getByRole('button', { name: '사무실이사' })
    await user.click(chip)
    expect(submit).toBeEnabled()

    await user.click(chip)
    expect(submit).toBeDisabled()
  })

  it('바꾼 서비스와 지역으로 수정한다', async () => {
    const { user, submit } = renderCustomerProfileForm('edit')

    await user.click(screen.getByRole('button', { name: '가정이사' }))
    await user.click(screen.getByRole('button', { name: '부산' }))
    await user.click(submit)

    expect(updateProfileState.mutate).toHaveBeenCalledWith({
      serviceTypes: ['SMALL'],
      regions: ['부산'],
    })
    expect(createProfileState.mutate).not.toHaveBeenCalled()
  })

  it('다시 불러온 프로필은 고치지 않은 항목에 반영하고 보내지 않는다', async () => {
    const { user, rerender, submit } = renderCustomerProfileForm('edit')
    await user.click(screen.getByRole('button', { name: '부산' }))

    currentUser.user = createCustomer({
      serviceTypes: ['OFFICE'],
      regions: ['서울'],
    })
    rerender()

    for (const [name, pressed] of [
      ['소형이사', 'false'],
      ['사무실이사', 'true'],
      ['부산', 'true'],
    ]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        pressed,
      )
    }

    await user.click(submit)

    expect(updateProfileState.mutate).toHaveBeenCalledWith({
      regions: ['부산'],
    })
  })

  it('취소하면 수정하지 않고 이전 페이지로 돌아간다', async () => {
    const { user } = renderCustomerProfileForm('edit')

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(router.back).toHaveBeenCalled()
    expect(updateProfileState.mutate).not.toHaveBeenCalled()
  })

  it('수정 중에는 칩과 버튼을 모두 잠근다', () => {
    updateProfileState.isPending = true
    const { services, submit } = renderCustomerProfileForm('edit')

    for (const chip of services.querySelectorAll('button')) {
      expect(chip).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })

  it('수정이 끝나면 다시 고칠 수 있다', () => {
    updateProfileState.isSuccess = true
    const { services } = renderCustomerProfileForm('edit')

    for (const chip of services.querySelectorAll('button')) {
      expect(chip).toBeEnabled()
    }
  })
})
