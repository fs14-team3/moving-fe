import { AxiosError, type AxiosResponse } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { logout } from '@/features/auth/api'
import { api } from '@/lib/api'

function createAxiosError(status: number) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse)
}

describe('logout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('세션이 이미 만료된 401 응답은 로그아웃 성공으로 본다', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(createAxiosError(401))

    await expect(logout()).resolves.toBeUndefined()
  })

  it('그 밖의 오류는 그대로 던진다', async () => {
    const error = createAxiosError(500)
    vi.spyOn(api, 'post').mockRejectedValue(error)

    await expect(logout()).rejects.toBe(error)
  })
})
