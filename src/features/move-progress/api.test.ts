import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getMoveProgress,
  recordMoveProgress,
} from '@/features/move-progress/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getMoveProgress', () => {
  it('견적의 이사 진행 상황을 반환한다', async () => {
    const progress = { steps: [], nextStep: 'DEPARTED', canRecord: false }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: progress })

    await expect(getMoveProgress('quote-1')).resolves.toEqual(progress)
    expect(get).toHaveBeenCalledWith('/quotes/quote-1/progress')
  })
})

describe('recordMoveProgress', () => {
  it('기록할 단계를 보내고 기록 후 진행 상황을 반환한다', async () => {
    const progress = { steps: [], nextStep: 'LOADING', canRecord: true }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: progress })

    await expect(recordMoveProgress('quote-1', 'DEPARTED')).resolves.toEqual(
      progress,
    )
    expect(post).toHaveBeenCalledWith('/quotes/quote-1/progress', {
      step: 'DEPARTED',
    })
  })
})
