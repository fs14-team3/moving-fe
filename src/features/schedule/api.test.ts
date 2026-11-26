import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getConfirmedQuotes, PAGE_SIZE } from '@/features/schedule/api'
import { getSentQuotes, type SentQuote } from '@/features/sent-quotes/api'

vi.mock('@/features/sent-quotes/api', () => ({
  getSentQuotes: vi.fn(),
}))

function createQuote(id: string): SentQuote {
  return {
    id,
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName: '김코드',
      moveType: 'SMALL',
      moveDate: '2026-12-01',
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

describe('getConfirmedQuotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('확정된 견적만 최대 개수로 요청한다', async () => {
    vi.mocked(getSentQuotes).mockResolvedValueOnce({
      items: [createQuote('1')],
      hasNext: false,
      nextCursor: null,
    })

    await getConfirmedQuotes()

    expect(getSentQuotes).toHaveBeenCalledWith({
      status: 'CONFIRMED',
      limit: PAGE_SIZE,
      cursor: undefined,
    })
  })

  it('다음 페이지가 없으면 한 번만 요청한다', async () => {
    vi.mocked(getSentQuotes).mockResolvedValueOnce({
      items: [createQuote('1'), createQuote('2')],
      hasNext: false,
      nextCursor: null,
    })

    const quotes = await getConfirmedQuotes()

    expect(getSentQuotes).toHaveBeenCalledTimes(1)
    expect(quotes.map(({ id }) => id)).toEqual(['1', '2'])
  })

  it('다음 페이지가 있으면 커서로 이어서 모두 받아 한 배열로 합친다', async () => {
    vi.mocked(getSentQuotes)
      .mockResolvedValueOnce({
        items: [createQuote('1')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createQuote('2')],
        hasNext: true,
        nextCursor: 'cursor-3',
      })
      .mockResolvedValueOnce({
        items: [createQuote('3')],
        hasNext: false,
        nextCursor: null,
      })

    const quotes = await getConfirmedQuotes()

    expect(quotes.map(({ id }) => id)).toEqual(['1', '2', '3'])
    expect(getSentQuotes).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ cursor: 'cursor-2' }),
    )
    expect(getSentQuotes).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ cursor: 'cursor-3' }),
    )
  })

  it('다음 페이지가 있다는데 커서가 없으면 멈춘다', async () => {
    vi.mocked(getSentQuotes).mockResolvedValueOnce({
      items: [createQuote('1')],
      hasNext: true,
      nextCursor: null,
    })

    const quotes = await getConfirmedQuotes()

    expect(getSentQuotes).toHaveBeenCalledTimes(1)
    expect(quotes).toHaveLength(1)
  })

  it('계속 다음 페이지가 이어져도 20번까지만 요청한다', async () => {
    vi.mocked(getSentQuotes).mockResolvedValue({
      items: [createQuote('1')],
      hasNext: true,
      nextCursor: 'cursor',
    })

    const quotes = await getConfirmedQuotes()

    expect(getSentQuotes).toHaveBeenCalledTimes(20)
    expect(quotes).toHaveLength(20)
  })

  it('중간에 요청이 실패하면 그 오류를 그대로 던진다', async () => {
    vi.mocked(getSentQuotes)
      .mockResolvedValueOnce({
        items: [createQuote('1')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockRejectedValueOnce(new Error('network'))

    await expect(getConfirmedQuotes()).rejects.toThrow('network')
  })
})
