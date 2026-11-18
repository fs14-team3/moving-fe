import { describe, expect, it, vi } from 'vitest'
import { getMoveEstimate } from '@/features/move-estimate/api'
import api from '@/lib/api'

describe('getMoveEstimate', () => {
  it('이사 정보로 예상 비용을 조회한다', async () => {
    const estimate = {
      distanceKm: 12.3,
      minPrice: 710_000,
      maxPrice: 950_000,
      surcharges: [],
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: estimate })
    const query = {
      moveType: 'HOME' as const,
      moveDate: '2026-12-05',
      from: '서울 중구 세종대로 110',
      to: '서울 강남구 테헤란로 152',
    }

    await expect(getMoveEstimate(query)).resolves.toEqual(estimate)
    expect(get).toHaveBeenCalledWith('/estimates', {
      params: query,
      signal: undefined,
    })
  })
})
