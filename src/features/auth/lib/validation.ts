const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getEmailError(email: string) {
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '올바른 이메일 형식이 아닙니다.'
  return undefined
}

export function getPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.'
  return undefined
}
