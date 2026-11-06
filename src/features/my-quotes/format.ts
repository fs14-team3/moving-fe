const REQUEST_DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// 견적 신청일. 한국 시간 기준으로 '2024년 6월 24일'처럼 보여준다.
export function formatRequestDate(dateTime: string) {
  return REQUEST_DATE_FORMAT.format(new Date(dateTime))
}
