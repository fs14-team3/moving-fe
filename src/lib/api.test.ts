import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { isUnauthorized } from '@/lib/api'

function createAxiosError(status?: number) {
  const response =
    status === undefined ? undefined : ({ status } as AxiosResponse)
  return new AxiosError(
    'Request failed',
    undefined,
    undefined,
    undefined,
    response,
  )
}

describe('isUnauthorized', () => {
  it('401 응답이면 true를 반환한다', () => {
    expect(isUnauthorized(createAxiosError(401))).toBe(true)
  })

  it.each([403, 500])('%i 응답이면 false를 반환한다', (status) => {
    expect(isUnauthorized(createAxiosError(status))).toBe(false)
  })

  it('응답이 없는 네트워크 오류나 axios 오류가 아니면 false를 반환한다', () => {
    expect(isUnauthorized(createAxiosError())).toBe(false)
    expect(isUnauthorized(new Error('401'))).toBe(false)
  })
})
