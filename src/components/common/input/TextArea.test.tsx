import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TextArea from '@/components/common/input/TextArea'

describe('TextArea', () => {
  it('최소 글자 수가 있으면 현재 글자 수와 최소 글자 수를 보여 준다', () => {
    render(
      <TextArea
        aria-label="코멘트"
        readOnly
        value="안녕"
        charCount={{ count: 2, min: 10 }}
      />,
    )

    expect(
      screen.getByRole('textbox', { name: '코멘트' }),
    ).toHaveAccessibleDescription('2 / 최소 10자')
  })
})
