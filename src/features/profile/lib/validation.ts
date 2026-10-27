const DIGITS_PATTERN = /^\d+$/
const CAREER_YEARS_MAX = 99
const INTRO_MIN_LENGTH = 8
const DESCRIPTION_MIN_LENGTH = 10

export function getNicknameError(nickname: string) {
  if (!nickname) return '별명을 입력해 주세요.'
  return undefined
}

export function getCareerYearsError(careerYears: string) {
  if (!careerYears) return '경력을 입력해 주세요.'
  if (!DIGITS_PATTERN.test(careerYears)) return '숫자만 입력해 주세요.'
  if (Number(careerYears) > CAREER_YEARS_MAX) {
    return `${CAREER_YEARS_MAX}년 이하로 입력해 주세요.`
  }
  return undefined
}

export function getIntroError(intro: string) {
  if (intro.length < INTRO_MIN_LENGTH) {
    return `${INTRO_MIN_LENGTH}자 이상 입력해 주세요.`
  }
  return undefined
}

export function getDescriptionError(description: string) {
  if (description.length < DESCRIPTION_MIN_LENGTH) {
    return `${DESCRIPTION_MIN_LENGTH}자 이상 입력해 주세요.`
  }
  return undefined
}

export function getSelectionError(values: string[]) {
  if (values.length === 0) return '1개 이상 선택해 주세요.'
  return undefined
}
