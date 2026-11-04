import type { SentQuote } from '@/features/sent-quotes/api'

// 오늘 날짜를 한국 시간 기준 'YYYY-MM-DD'로 만든다. (BE도 한국 날짜로 비교한다)
export function todayInSeoul(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
    now,
  )
}

// 이사가 끝난 요청인지 확인한다.
// BE는 이사일이 지나도 바로 COMPLETED로 바꾸지 않고, 그 고객이 새 요청을 만들 때만 바꾼다.
// 그래서 확정된 요청은 이사일이 오늘보다 전이면 끝난 것으로 본다. (BE와 같은 기준: 이사일 < 오늘)
export function isMoveCompleted(
  { status, moveDate }: SentQuote['moveRequest'],
  today = todayInSeoul(),
) {
  if (status === 'COMPLETED') return true
  return status === 'CONFIRMED' && moveDate < today
}
