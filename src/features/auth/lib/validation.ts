const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PHONE_PATTERN = /^010\d{8}$/
const PASSWORD_CHARACTERS_PATTERN = /^[!-~]+$/
const LETTER_PATTERN = /[A-Za-z]/
const DIGIT_PATTERN = /\d/
const SPECIAL_CHARACTER_PATTERN = /[!-/:-@[-`{-~]/
const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 16
const PHONE_MAX_LENGTH = 11

export const PASSWORD_RULE_MESSAGE =
  '공백 없이 영문, 숫자, 특수문자를 포함해 8~16자로 입력해 주세요.'

export function getNameError(name: string) {
  if (!name) return '이름을 입력해 주세요.'
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return '이름은 2~20자로 입력해 주세요.'
  }
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

export function toPhoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH)
}

export function getPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.'
  return undefined
}

export function getNewPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.'
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH ||
    !PASSWORD_CHARACTERS_PATTERN.test(password) ||
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
