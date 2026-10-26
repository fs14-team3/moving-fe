import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { describe, expect, it } from 'vitest'
import {
  ApiError,
  isApiError,
  isClientError,
  isUnauthorized,
  toApiError,
} from './api-error'

function createAxiosError(response?: { status: number; data: unknown }) {
  const config = {
    headers: {},
  } as InternalAxiosRequestConfig

  const axiosResponse = response
    ? ({
        config,
        data: response.data,
        headers: {},
        status: response.status,
        statusText: '',
      } satisfies AxiosResponse)
    : undefined

  return new AxiosError(
    '요청에 실패했습니다.',
    response ? AxiosError.ERR_BAD_REQUEST : AxiosError.ERR_NETWORK,
    config,
    undefined,
    axiosResponse,
  )
}

describe('toApiError', () => {
  it('서버 오류 응답을 공통 ApiError 형태로 변환한다', () => {
    const error = createAxiosError({
      status: 400,
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 올바르지 않습니다.',
          details: [
            {
              field: 'email',
              reason: '올바른 이메일 형식이 아닙니다.',
            },
          ],
        },
      },
    })

    const result = toApiError(error)
    expect(result).toBeInstanceOf(ApiError)
    expect(result).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다.',
      status: 400,
      details: [
        {
          field: 'email',
          reason: '올바른 이메일 형식이 아닙니다.',
        },
      ],
    })
    expect(result.cause).toBe(error)
  })

  it('서버로부터 응답을 받지 못하면 네트워크 오류로 변환한다', () => {
    const error = createAxiosError()
    const result = toApiError(error)

    expect(result).toBeInstanceOf(ApiError)
    expect(result).toMatchObject({
      code: 'NETWORK_ERROR',
      message: '서버로부터 응답을 받지 못했습니다.',
      status: null,
    })
    expect(result.cause).toBe(error)
  })

  it('Axios 오류가 아니면 알 수 없는 오류로 변환한다', () => {
    const originalError = new Error('일반 오류')
    const result = toApiError(originalError)

    expect(result).toBeInstanceOf(ApiError)
    expect(result).toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: null,
    })
    expect(result.cause).toBe(originalError)
  })

  it('서버 오류 응답 형식이 올바르지 않으면 기본값을 사용한다', () => {
    const error = createAxiosError({
      status: 500,
      data: {},
    })

    const result = toApiError(error)

    expect(result).toBeInstanceOf(ApiError)
    expect(result).toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: 500,
      details: undefined,
    })
    expect(result.cause).toBe(error)
  })
})

describe('isApiError', () => {
  it('ApiError 인스턴스이면 true를 반환한다', () => {
    const error = new ApiError('UNAUTHORIZED', '로그인이 필요합니다.', 401)

    expect(isApiError(error)).toBe(true)
  })

  it('ApiError 인스턴스가 아니면 false를 반환한다', () => {
    const axiosError = createAxiosError({
      status: 401,
      data: {},
    })

    expect(isApiError(new Error('일반 오류'))).toBe(false)
    expect(isApiError(axiosError)).toBe(false)
    expect(
      isApiError({
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
        status: 401,
      }),
    ).toBe(false)
  })
})

describe('isUnauthorized', () => {
  it('401 응답이면 true를 반환한다', () => {
    const error = toApiError(createAxiosError({ status: 401, data: {} }))

    expect(isUnauthorized(error)).toBe(true)
  })

  it.each([403, 500])('%i 응답이면 false를 반환한다', (status) => {
    const error = toApiError(createAxiosError({ status, data: {} }))

    expect(isUnauthorized(error)).toBe(false)
  })

  it('응답이 없는 네트워크 오류나 ApiError로 변환되지 않은 오류는 false를 반환한다', () => {
    const networkError = toApiError(createAxiosError())
    const axiosError = createAxiosError({ status: 401, data: {} })

    expect(isUnauthorized(networkError)).toBe(false)
    expect(isUnauthorized(axiosError)).toBe(false)
    expect(isUnauthorized(new Error('401'))).toBe(false)
  })
})

describe('isClientError', () => {
  it.each([400, 401, 404, 429, 499])(
    '%i 응답이면 true를 반환한다',
    (status) => {
      const error = toApiError(createAxiosError({ status, data: {} }))

      expect(isClientError(error)).toBe(true)
    },
  )

  it.each([399, 500, 503])('%i 응답이면 false를 반환한다', (status) => {
    const error = toApiError(createAxiosError({ status, data: {} }))

    expect(isClientError(error)).toBe(false)
  })

  it('응답이 없는 네트워크 오류나 ApiError로 변환되지 않은 오류는 false를 반환한다', () => {
    const networkError = toApiError(createAxiosError())
    const axiosError = createAxiosError({ status: 404, data: {} })

    expect(isClientError(networkError)).toBe(false)
    expect(isClientError(axiosError)).toBe(false)
    expect(isClientError(new Error('404'))).toBe(false)
  })
})
