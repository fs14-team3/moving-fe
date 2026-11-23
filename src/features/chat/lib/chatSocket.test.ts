import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  io: vi.fn(),
}))

vi.mock('socket.io-client', () => ({
  io: mocks.io,
}))

import { createChatSocket } from '@/features/chat/lib/chatSocket'

describe('createChatSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api')
    mocks.io.mockReturnValue({})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('API URL에서 Origin을 추출해 소켓을 생성한다', () => {
    createChatSocket()

    expect(mocks.io).toHaveBeenCalledWith('http://localhost:4000', {
      autoConnect: false,
      withCredentials: true,
    })
  })

  it('API URL 환경변수가 없으면 오류를 발생시킨다', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '')

    expect(() => createChatSocket()).toThrow(
      'NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.',
    )

    expect(mocks.io).not.toHaveBeenCalled()
  })
})
