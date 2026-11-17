const SEOUL_TIME_ZONE = 'Asia/Seoul'

function getSeoulDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

export function formatChatTime(value: string | null) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const dateKey = getSeoulDateKey(date)
  const todayKey = getSeoulDateKey(now)

  if (dateKey === todayKey) {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: SEOUL_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateKey === getSeoulDateKey(yesterday)) {
    return '어제'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace('. ', '.')
    .replace('.', '.')
}
