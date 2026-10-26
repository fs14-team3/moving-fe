import { describe, expect, it } from 'vitest'
import { getLoginPath, getPathAfterLogin } from '@/features/auth/lib/paths'
import type { Me, Role } from '@/features/auth/types'

function createUser(role: Role, hasProfile = true): Me {
  return {
    id: 'user-1',
    role,
    name: null,
    email: null,
    phone: null,
    hasProfile,
    customerProfile: null,
    moverProfile: null,
  }
}

const customer = createUser('CUSTOMER')
const mover = createUser('MOVER')

describe('getPathAfterLogin', () => {
  it.each([
    '//example.com',
    '/.//example.com',
    '/./\\example.com',
    '/a/..//example.com',
    '/%2e//example.com',
    '/\\example.com',
    '/\t/example.com',
    'https://example.com',
    'javascript:alert(1)',
    '//[',
  ])('외부 주소로 해석되는 redirect %j는 기본 페이지로 바꾼다', (redirect) => {
    expect(getPathAfterLogin(customer, redirect)).toBe(
      getPathAfterLogin(customer),
    )
  })

  it('redirect의 쿼리와 해시를 유지한다', () => {
    expect(
      getPathAfterLogin(mover, '/mover/requests?status=pending#quote'),
    ).toBe('/mover/requests?status=pending#quote')
  })

  it('다른 유저 타입의 페이지나 비회원 전용 페이지로는 보내지 않는다', () => {
    expect(getPathAfterLogin(customer, '/mover/requests')).toBe(
      getPathAfterLogin(customer),
    )
    expect(getPathAfterLogin(customer, '/login')).toBe(
      getPathAfterLogin(customer),
    )
  })

  it('프로필이 없으면 redirect보다 프로필 등록을 먼저 한다', () => {
    const newMover = createUser('MOVER', false)

    expect(getPathAfterLogin(newMover, '/mover/requests')).toBe(
      getPathAfterLogin(newMover),
    )
  })
})

describe('getLoginPath', () => {
  it('로그인 뒤 돌아갈 주소를 쿼리와 해시까지 담는다', () => {
    const path = '/mover/requests?status=pending&page=2#quote'
    const loginUrl = new URL(getLoginPath('MOVER', path), 'http://localhost')

    expect(loginUrl.pathname).toBe('/mover/login')
    expect(
      getPathAfterLogin(mover, loginUrl.searchParams.get('redirect')),
    ).toBe(path)
  })
})
