import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDamageReports } from '@/features/damage-reports/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getDamageReports', () => {
  it('견적의 파손 접수 목록을 반환한다', async () => {
    const list = { items: [], canReport: false }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: list })

    await expect(getDamageReports('quote-1')).resolves.toEqual(list)
    expect(get).toHaveBeenCalledWith('/quotes/quote-1/damage-reports')
  })
})
