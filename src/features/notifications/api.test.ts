import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
} from '@/features/notifications/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getNotifications', () => {
  it('커서를 query로 보내고 알림 목록을 반환한다', async () => {
    const page = { items: [], hasNext: false, nextCursor: null }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page })

    await expect(getNotifications({ cursor: 'cursor-2' })).resolves.toEqual(
      page,
    )
    expect(get).toHaveBeenCalledWith('/notifications', {
      params: { cursor: 'cursor-2' },
    })
  })
})

describe('getUnreadNotificationCount', () => {
  it('읽지 않은 알림 개수를 반환한다', async () => {
    const get = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: { unreadCount: 3 } })

    await expect(getUnreadNotificationCount()).resolves.toBe(3)
    expect(get).toHaveBeenCalledWith('/notifications/unread-count')
  })
})

describe('readAllNotifications', () => {
  it('전체 알림을 읽음 처리한다', async () => {
    const patch = vi
      .spyOn(api, 'patch')
      .mockResolvedValue({ data: { updatedCount: 2 } })

    await expect(readAllNotifications()).resolves.toEqual({ updatedCount: 2 })
    expect(patch).toHaveBeenCalledWith('/notifications/read-all')
  })
})
