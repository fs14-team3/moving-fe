import { afterEach, describe, expect, it, vi } from 'vitest'
import { login, logout, signup } from '@/features/auth/api'
import type { Me } from '@/features/auth/types'
import api from '@/lib/api'
import { ApiError } from '@/lib/api-error'

function createApiError(status: number) {
  return new ApiError('UNKNOWN_ERROR', 'Request failed', status)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('signup', () => {
  it('입력한 정보로 가입하고 가입한 유저 정보를 반환한다', async () => {
    const user: Me = {
      id: 'user-1',
      role: 'CUSTOMER',
      name: '김고객',
      email: 'customer@example.com',
      phone: '01012345678',
      hasProfile: false,
      customerProfile: null,
      moverProfile: null,
    }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: user })
    const body = {
      role: 'CUSTOMER' as const,
      name: '김고객',
      email: 'customer@example.com',
      phone: '01012345678',
      password: 'moving1!',
    }

    await expect(signup(body)).resolves.toEqual(user)
    expect(post).toHaveBeenCalledWith('/auth/signup', body)
  })
})

describe('login', () => {
  it('유저 타입과 함께 로그인하고 응답의 유저 정보를 반환한다', async () => {
    const user: Me = {
      id: 'user-1',
      role: 'MOVER',
      name: '김기사',
      email: 'mover@example.com',
      phone: null,
      hasProfile: false,
      customerProfile: null,
      moverProfile: null,
    }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { user } })
    const body = {
      role: 'MOVER' as const,
      email: 'mover@example.com',
      password: 'password1!',
    }

    await expect(login(body)).resolves.toEqual(user)
    expect(post).toHaveBeenCalledWith('/auth/login', body)
  })
})

describe('logout', () => {
  it('세션이 이미 만료된 401 응답은 로그아웃 성공으로 본다', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(createApiError(401))

    await expect(logout()).resolves.toBeUndefined()
  })

  it('그 밖의 오류는 그대로 던진다', async () => {
    const error = createApiError(500)
    vi.spyOn(api, 'post').mockRejectedValue(error)

    await expect(logout()).rejects.toBe(error)
  })
})
