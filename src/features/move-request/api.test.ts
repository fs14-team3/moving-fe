import {
  createDesignation,
  createMoveRequest,
  getActiveMoveRequest,
} from '@/features/move-request/api'
import api from '@/lib/api'
import { describe, expect, it, vi } from 'vitest'
import {
  MOCK_CREATE_MOVE_REQUEST_BODY,
  MOCK_DESIGNATION,
  MOCK_MOVE_REQUEST,
} from './fixtures/moveRequests'

describe('createMoveRequest', () => {
  it('견적 요청을 생성한다', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue({ data: MOCK_MOVE_REQUEST })

    await expect(
      createMoveRequest(MOCK_CREATE_MOVE_REQUEST_BODY),
    ).resolves.toEqual(MOCK_MOVE_REQUEST)
    expect(post).toHaveBeenCalledWith(
      '/move-requests',
      MOCK_CREATE_MOVE_REQUEST_BODY,
    )
  })
})

describe('getActiveMoveRequest', () => {
  it('활성 견적 요청을 조회한다', async () => {
    const get = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: { moveRequest: MOCK_MOVE_REQUEST } })

    await expect(getActiveMoveRequest()).resolves.toEqual({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    expect(get).toHaveBeenCalledWith('/move-requests/active')
  })
})

describe('createDesignation', () => {
  it('지정 견적 요청을 생성한다', async () => {
    const requestId = MOCK_MOVE_REQUEST.id
    const moverId = MOCK_DESIGNATION.moverId

    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue({ data: MOCK_DESIGNATION })

    await expect(createDesignation(requestId, moverId)).resolves.toEqual(
      MOCK_DESIGNATION,
    )
    expect(post).toHaveBeenCalledWith(
      `/move-requests/${requestId}/designations`,
      { moverId },
    )
  })
})
