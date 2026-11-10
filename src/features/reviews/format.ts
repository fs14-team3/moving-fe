// 'YYYY-MM-DD'로 나온다.
const SEOUL_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
})

// 리뷰 작성일. 한국 시간 기준으로 '2024.07.02'처럼 보여준다.
export function formatReviewDate(dateTime: string) {
  return SEOUL_DATE_FORMAT.format(new Date(dateTime)).replaceAll('-', '.')
}
