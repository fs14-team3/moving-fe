import { describe, expect, it } from 'vitest'
import {
  getCareerYearsError,
  getDescriptionError,
  getImageFileError,
  getIntroError,
  getNicknameError,
  getSelectionError,
} from '@/features/profile/lib/validation'

describe('getNicknameError', () => {
  it('별명이 비어 있으면 입력을 요청한다', () => {
    expect(getNicknameError('')).toBe('별명을 입력해 주세요.')
    expect(getNicknameError('김코드')).toBeUndefined()
  })
})

describe('getCareerYearsError', () => {
  it.each([
    ['', '경력을 입력해 주세요.'],
    ['10년', '숫자만 입력해 주세요.'],
    ['1.5', '숫자만 입력해 주세요.'],
    ['-1', '숫자만 입력해 주세요.'],
    ['100', '99년 이하로 입력해 주세요.'],
  ])('%j는 "%s"를 안내한다', (careerYears, message) => {
    expect(getCareerYearsError(careerYears)).toBe(message)
  })

  it.each(['0', '8', '10', '99'])('%j는 통과한다', (careerYears) => {
    expect(getCareerYearsError(careerYears)).toBeUndefined()
  })
})

describe('getIntroError', () => {
  it('8자보다 짧으면 안내한다', () => {
    expect(getIntroError('안녕하세요.')).toBe('8자 이상 입력해 주세요.')
    expect(getIntroError('꼼꼼한 이사입니다')).toBeUndefined()
  })
})

describe('getDescriptionError', () => {
  it('10자보다 짧으면 안내한다', () => {
    expect(getDescriptionError('후기')).toBe('10자 이상 입력해 주세요.')
    expect(getDescriptionError('안전하게 옮겨 드립니다')).toBeUndefined()
  })
})

describe('getSelectionError', () => {
  it('하나도 고르지 않으면 안내한다', () => {
    expect(getSelectionError([])).toBe('1개 이상 선택해 주세요.')
    expect(getSelectionError(['서울'])).toBeUndefined()
  })
})

describe('getImageFileError', () => {
  const file = (type: string, size: number) =>
    new File([new Uint8Array(size)], 'me', { type })

  it.each([
    ['image/jpeg', 10, undefined],
    ['image/png', 5 * 1024 * 1024, undefined],
    ['image/webp', 10, undefined],
    ['image/gif', 10, 'JPG, PNG, WEBP 이미지를 선택해 주세요.'],
    ['image/heic', 10, 'JPG, PNG, WEBP 이미지를 선택해 주세요.'],
    ['image/png', 5 * 1024 * 1024 + 1, '5MB 이하의 이미지를 선택해 주세요.'],
  ])('%s %d바이트는 %j', (type, size, message) => {
    expect(getImageFileError(file(type, size))).toBe(message)
  })
})
