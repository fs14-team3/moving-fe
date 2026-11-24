import { describe, expect, it } from 'vitest'
import { getOptionLabel, type Option } from '@/lib/options'

const OPTIONS: Option<string>[] = [
  { value: 'SMALL', label: '소형이사' },
  { value: 'HOME', label: '가정이사' },
]

describe('getOptionLabel', () => {
  it('값에 맞는 옵션의 라벨을 반환한다', () => {
    expect(getOptionLabel(OPTIONS, 'HOME')).toBe('가정이사')
  })

  it('목록에 없는 값이면 값을 그대로 보여 준다', () => {
    expect(getOptionLabel(OPTIONS, 'OFFICE')).toBe('OFFICE')
  })
})
