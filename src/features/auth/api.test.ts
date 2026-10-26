import { afterEach, describe, expect, it, vi } from 'vitest'
import { logout } from '@/features/auth/api'
import api from '@/lib/api'
import { ApiError } from '@/lib/api-error'

function createApiError(status: number) {
  return new ApiError('UNKNOWN_ERROR', 'Request failed', status)
}

describe('logout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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
