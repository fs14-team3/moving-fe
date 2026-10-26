import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('api', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('공통 Axios 옵션을 적용한다', async () => {
    const { default: api } = await import('./api')

    expect(api.defaults.baseURL).toBe('http://localhost:4000/api')
    expect(api.defaults.withCredentials).toBe(true)
    expect(api.defaults.timeout).toBe(10000)
  })

  it('응답 인터셉터에서 Axios 오류를 ApiError로 변환한다', async () => {
    const { default: api } = await import('./api')
    const { ApiError } = await import('./api-error')

    api.defaults.adapter = async (config) => {
      const response = {
        config,
        data: {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        headers: {},
        status: 401,
        statusText: 'Unauthorized',
      }

      throw new AxiosError(
        'Request failed with status code 401',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response,
      )
    }

    const error = await api.get('/users/me').catch((error: unknown) => error)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
      status: 401,
      details: undefined,
    })
  })
})
