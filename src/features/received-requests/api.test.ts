import { afterEach, describe, expect, it, vi } from 'vitest'
import { rejectRequest } from '@/features/received-requests/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('rejectRequest', () => {
  it('요청 id 경로로 반려하고 반려한 요청을 반환한다', async () => {
    const rejected = { rejectedAt: '2026-10-30T09:00:00.000Z' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: rejected })

    await expect(rejectRequest('request-1')).resolves.toEqual(rejected)
    expect(post).toHaveBeenCalledWith('/move-requests/request-1/rejections')
  })
})
