const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PHONE_PATTERN = /^(010\d{8}|01[16789]\d{7,8})$/
const LETTER_PATTERN = /[A-Za-z]/
const DIGIT_PATTERN = /\d/
const SPECIAL_CHARACTER_PATTERN = /[!-/:-@[-`{-~]/
const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_RULE_MESSAGE =
  '영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.'

export function getNameError(name: string) {
  if (!name) return '이름을 입력해 주세요.'
  return undefined
}

export function getEmailError(email: string) {
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '올바른 이메일 형식이 아닙니다.'
  return undefined
}

export function getPhoneError(phone: string) {
  if (!phone) return '전화번호를 입력해 주세요.'
  if (!MOBILE_PHONE_PATTERN.test(phone)) {
    return '올바른 휴대전화 번호를 입력해 주세요.'
  }
  return undefined
}

export function getPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.'
  return undefined
}

export function getNewPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.'
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    !LETTER_PATTERN.test(password) ||
    !DIGIT_PATTERN.test(password) ||
    !SPECIAL_CHARACTER_PATTERN.test(password)
  ) {
    return PASSWORD_RULE_MESSAGE
  }
  return undefined
}

export function getPasswordConfirmError(
  password: string,
  passwordConfirm: string,
) {
  if (!passwordConfirm) return '비밀번호를 한 번 더 입력해 주세요.'
  if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.'
  return undefined
}
