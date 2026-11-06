const REQUEST_DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// 'YYYY-MM-DD'로 나온다.
const SEOUL_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
})

// 견적 신청일. 한국 시간 기준으로 '2024년 6월 24일'처럼 보여준다.
export function formatRequestDate(dateTime: string) {
  return REQUEST_DATE_FORMAT.format(new Date(dateTime))
}

// 받았던 견적의 견적 신청일. 한국 시간 기준으로 '24. 06. 24.'처럼 보여준다.
export function formatShortRequestDate(dateTime: string) {
  const [year, month, day] = SEOUL_DATE_FORMAT.format(new Date(dateTime)).split(
    '-',
  )
  return `${year.slice(2)}. ${month}. ${day}.`
}
