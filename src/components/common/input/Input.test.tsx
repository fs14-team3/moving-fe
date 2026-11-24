import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Input from '@/components/common/input/Input'

describe('Input', () => {
  it('최대 글자 수가 있으면 오류와 함께 현재 글자 수와 최대 글자 수를 보여 준다', () => {
    render(
      <Input
        aria-label="이름"
        readOnly
        value="김"
        error="이름은 2~20자로 입력해 주세요."
        charCount={{ count: 1, max: 20 }}
      />,
    )

    expect(
      screen.getByRole('textbox', { name: '이름' }),
    ).toHaveAccessibleDescription('이름은 2~20자로 입력해 주세요. 1 / 20자')
  })
})
