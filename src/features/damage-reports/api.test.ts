import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDamagePhotoUploads,
  createDamageReport,
  getDamageReports,
} from '@/features/damage-reports/api'
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

describe('createDamagePhotoUploads', () => {
  it('장수와 형식을 보내고 업로드 정보를 반환한다', async () => {
    const items = [{ uploadId: 'upload-1' }]
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { items } })
    const { signal } = new AbortController()

    await expect(
      createDamagePhotoUploads(
        'quote-1',
        { count: 1, contentType: 'image/webp' },
        signal,
      ),
    ).resolves.toEqual(items)
    expect(post).toHaveBeenCalledWith(
      '/quotes/quote-1/damage-reports/uploads',
      { count: 1, contentType: 'image/webp' },
      { signal },
    )
  })
})

describe('createDamageReport', () => {
  it('품목명, 상세 내용, 올린 사진을 보내고 저장된 접수를 반환한다', async () => {
    const body = {
      itemName: '4인용 식탁',
      description: '상판 모서리가 깨졌어요.',
      uploadIds: ['upload-1'],
    }
    const report = { id: 'report-1', ...body }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: report })

    await expect(createDamageReport('quote-1', body)).resolves.toEqual(report)
    expect(post).toHaveBeenCalledWith('/quotes/quote-1/damage-reports', body)
  })
})
