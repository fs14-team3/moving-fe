import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMoveProgress } from '@/features/move-progress/api'
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
