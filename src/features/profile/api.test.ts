import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Role } from '@/features/auth/types'
import { createProfile } from '@/features/profile/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createProfile', () => {
  it.each<[Role, string]>([
    ['CUSTOMER', '/customers/me/profile'],
    ['MOVER', '/movers/me/profile'],
  ])(
    '%s 프로필은 %s로 등록하고 등록한 프로필을 반환한다',
    async (role, path) => {
      const body = { serviceTypes: ['SMALL' as const], regions: ['서울'] }
      const post = vi.spyOn(api, 'post').mockResolvedValue({ data: body })

      await expect(createProfile(role, body)).resolves.toEqual(body)
      expect(post).toHaveBeenCalledWith(path, body)
    },
  )
})
