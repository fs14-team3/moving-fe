import type { SentQuote } from '@/features/sent-quotes/api'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'

const DAY_MS = 24 * 60 * 60 * 1000

// 이사일(moveDate) 'YYYY-MM-DD'별로 견적을 묶는다. 같은 날 안에서는 받은 순서를 그대로 둔다.
export function groupByMoveDate(quotes: SentQuote[]) {
  const groups = new Map<string, SentQuote[]>()
  for (const quote of quotes) {
    const { moveDate } = quote.moveRequest
    const group = groups.get(moveDate)
    if (group) group.push(quote)
    else groups.set(moveDate, [quote])
  }
  return groups
}

// 오늘을 포함해 앞으로 남은 일정을 이사일이 가까운 순으로 돌려준다.
export function getUpcoming(quotes: SentQuote[], today = todayInSeoul()) {
  return quotes
    .filter(({ moveRequest }) => moveRequest.moveDate >= today)
    .sort((a, b) =>
      a.moveRequest.moveDate.localeCompare(b.moveRequest.moveDate),
    )
}

// 오늘부터 이사일까지 남은 날짜. 지난 날짜는 음수다.
export function getDaysUntil(moveDate: string, today = todayInSeoul()) {
  const diff =
    Date.parse(`${moveDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  return Math.round(diff / DAY_MS)
}

// 'D-3', 'D-DAY', 'D+2'
export function formatDday(days: number) {
  if (days === 0) return 'D-DAY'
  return days > 0 ? `D-${days}` : `D+${-days}`
}

// 달력이 돌려주는 Date를 'YYYY-MM-DD'로 바꾼다. 브라우저 시간 기준 연 · 월 · 일을 그대로 쓴다.
// toISOString()은 UTC로 바뀌어 한국에서 하루 밀릴 수 있다.
export function toDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 'YYYY-MM-DD'를 달력에 넘길 Date로 바꾼다. new Date('YYYY-MM-DD')는 UTC로 읽혀 하루 밀릴 수 있다.
export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}
