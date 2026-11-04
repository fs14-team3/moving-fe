const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// 지금부터 얼마나 지났는지 '1시간 전'처럼 보여준다.
export function formatTimeAgo(dateTime: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(dateTime).getTime())
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  return `${Math.floor(diff / DAY)}일 전`
}
