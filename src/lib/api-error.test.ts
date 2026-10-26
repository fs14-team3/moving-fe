import { describe, expect, it } from 'vitest'
import { isApiError, toApiError } from './api-error'

function createAxiosError(response?: { status: number; data: unknown }) {
  return {
    isAxiosError: true,
    response,
  }
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

    expect(toApiError(error)).toEqual({
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
  })

  it('서버로부터 응답을 받지 못하면 네트워크 오류로 변환한다', () => {
    const error = createAxiosError()

    expect(toApiError(error)).toEqual({
      code: 'NETWORK_ERROR',
      message: '서버로부터 응답을 받지 못했습니다.',
      status: null,
    })
  })

  it('Axios 오류가 아니면 알 수 없는 오류로 변환한다', () => {
    expect(toApiError(new Error('일반 오류'))).toEqual({
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: null,
    })
  })

  it('서버 오류 응답 형식이 올바르지 않으면 기본값을 사용한다', () => {
    const error = createAxiosError({
      status: 500,
      data: {},
    })

    expect(toApiError(error)).toEqual({
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: 500,
      details: undefined,
    })
  })
})

describe('isApiError', () => {
  it('공통 API 오류 형태이면 true를 반환한다', () => {
    expect(
      isApiError({
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
        status: 401,
      }),
    ).toBe(true)
  })

  it('공통 API 오류 형태가 아니면 false를 반환한다', () => {
    expect(isApiError(new Error('일반 오류'))).toBe(false)
    expect(isApiError(null)).toBe(false)
    expect(
      isApiError({
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      }),
    ).toBe(false)
  })
})
