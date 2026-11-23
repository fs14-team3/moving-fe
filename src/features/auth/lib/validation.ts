const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PHONE_PATTERN = /^010\d{8}$/
const PASSWORD_CHARACTERS_PATTERN = /^[!-~]+$/
const LETTER_PATTERN = /[A-Za-z]/
const DIGIT_PATTERN = /\d/
const SPECIAL_CHARACTER_PATTERN = /[!-/:-@[-`{-~]/
const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 16
const PHONE_PART_LENGTHS = [3, 4, 4]
const PHONE_MAX_DIGITS = 11

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
  return value.replace(/\D/g, '')
}

export function formatPhone(value: string): string {
  const [first = '', middle = '', ...rest] = value
    .split('-')
    .map(toPhoneDigits)
    .filter(Boolean)
  const parts = [first, middle, rest.join('')]
  let overflow = ''
  const formatted = PHONE_PART_LENGTHS.map((length, index) => {
    const digits = overflow + parts[index]
    overflow = digits.slice(length)
    return digits.slice(0, length)
  })
    .join('-')
    .replace(/-+$/, '')
  return overflow && value.includes('-')
    ? formatPhone(toPhoneDigits(value))
    : formatted
}

function blockExtraPhoneDigits(event: InputEvent) {
  const input = event.currentTarget as HTMLInputElement
  const inserted = event.data ?? event.dataTransfer?.getData('text') ?? ''
  const next =
    input.value.slice(0, input.selectionStart ?? 0) +
    inserted +
    input.value.slice(input.selectionEnd ?? 0)
  if (toPhoneDigits(next).length > PHONE_MAX_DIGITS) event.preventDefault()
}

function keepPhoneCaret(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const beforeCaret = input.value.slice(0, input.selectionStart ?? undefined)
  const caret = formatPhone(beforeCaret).length
  const skipsHyphen =
    (event as InputEvent).inputType === 'deleteContentForward' &&
    formatPhone(input.value)[caret] === '-'
  const position = skipsHyphen ? caret + 1 : caret
  requestAnimationFrame(() => input.setSelectionRange(position, position))
}

export function bindPhoneInput(input: HTMLInputElement | null) {
  if (!input) return
  input.addEventListener('beforeinput', blockExtraPhoneDigits)
  input.addEventListener('input', keepPhoneCaret)
  return () => {
    input.removeEventListener('beforeinput', blockExtraPhoneDigits)
    input.removeEventListener('input', keepPhoneCaret)
  }
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
