import { describe, expect, it } from 'vitest'
import { getEmailError, getPasswordError } from '@/features/auth/lib/validation'

describe('getEmailError', () => {
  it('비어 있으면 입력을 요청한다', () => {
    expect(getEmailError('')).toBe('이메일을 입력해 주세요.')
  })

  it.each(['customer', 'customer@example', '@example.com', 'a b@example.com'])(
    '%j는 형식 오류로 본다',
    (email) => {
      expect(getEmailError(email)).toBe('올바른 이메일 형식이 아닙니다.')
    },
  )

  it('올바른 이메일이면 오류가 없다', () => {
    expect(getEmailError('customer@example.com')).toBeUndefined()
  })
})

describe('getPasswordError', () => {
  it('비어 있으면 입력을 요청하고, 그 밖에는 오류가 없다', () => {
    expect(getPasswordError('')).toBe('비밀번호를 입력해 주세요.')
    expect(getPasswordError('a')).toBeUndefined()
  })
})
