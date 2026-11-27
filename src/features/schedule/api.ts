import { getSentQuotes, type SentQuote } from '@/features/sent-quotes/api'

// BE가 한 번에 줄 수 있는 최대 개수
export const PAGE_SIZE = 50

// 커서가 계속 이어지는 오류가 있어도 요청이 끝없이 나가지 않게 막는다. (50 x 20 = 1,000건)
const MAX_PAGES = 20

// 확정된 견적을 모두 받아온다. 달력은 월별로 보여 주고 BE에 날짜 범위 조건이 없어서 한 번에 다 받는다.
export async function getConfirmedQuotes() {
  const quotes: SentQuote[] = []
  let cursor: string | undefined

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await getSentQuotes({
      status: 'CONFIRMED',
      limit: PAGE_SIZE,
      cursor,
    })
    quotes.push(...result.items)

    if (!result.hasNext || !result.nextCursor) break
    cursor = result.nextCursor
  }

  return quotes
}
