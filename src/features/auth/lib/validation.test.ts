import { describe, expect, it } from 'vitest'
import {
  getEmailError,
  getNameError,
  getNewPasswordError,
  getPasswordConfirmError,
  getPasswordError,
  getPhoneError,
  PASSWORD_RULE_MESSAGE,
} from '@/features/auth/lib/validation'

describe('getNameError', () => {
  it('비어 있으면 입력을 요청하고, 그 밖에는 오류가 없다', () => {
    expect(getNameError('')).toBe('이름을 입력해 주세요.')
    expect(getNameError('김무빙')).toBeUndefined()
  })
})

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

describe('getPhoneError', () => {
  it('비어 있으면 입력을 요청한다', () => {
    expect(getPhoneError('')).toBe('전화번호를 입력해 주세요.')
  })

  it.each(['01012345678', '0111234567', '01612345678', '0191234567'])(
    '휴대전화 번호 %s는 오류가 없다',
    (phone) => {
      expect(getPhoneError(phone)).toBeUndefined()
    },
  )

  it.each(['0101234567', '010123456789', '01212345678', '010-1234-5678'])(
    '%s는 휴대전화 번호 형식 오류로 본다',
    (phone) => {
      expect(getPhoneError(phone)).toBe('올바른 휴대전화 번호를 입력해 주세요.')
    },
  )
})

describe('getPasswordError', () => {
  it('비어 있으면 입력을 요청하고, 그 밖에는 오류가 없다', () => {
    expect(getPasswordError('')).toBe('비밀번호를 입력해 주세요.')
    expect(getPasswordError('a')).toBeUndefined()
  })
})

describe('getNewPasswordError', () => {
  it('비어 있으면 입력을 요청한다', () => {
    expect(getNewPasswordError('')).toBe('비밀번호를 입력해 주세요.')
  })

  it('영문, 숫자, 특수문자를 포함한 8자 이상이면 오류가 없다', () => {
    expect(getNewPasswordError('moving1!')).toBeUndefined()
  })

  it.each([
    ['7자', 'movin1!'],
    ['특수문자가 없는', 'moving12'],
    ['숫자가 없는', 'moving!!'],
    ['영문이 없는', '1234567!'],
  ])('%s 비밀번호는 규칙 안내를 보여 준다', (_, password) => {
    expect(getNewPasswordError(password)).toBe(PASSWORD_RULE_MESSAGE)
  })
})

describe('getPasswordConfirmError', () => {
  it('비어 있으면 한 번 더 입력을 요청한다', () => {
    expect(getPasswordConfirmError('moving1!', '')).toBe(
      '비밀번호를 한 번 더 입력해 주세요.',
    )
  })

  it('비밀번호와 다르면 불일치를 알리고, 같으면 오류가 없다', () => {
    expect(getPasswordConfirmError('moving1!', 'moving1?')).toBe(
      '비밀번호가 일치하지 않습니다.',
    )
    expect(getPasswordConfirmError('moving1!', 'moving1!')).toBeUndefined()
  })
})
