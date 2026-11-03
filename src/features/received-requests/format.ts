import type { ReceivedRequest } from '@/features/received-requests/api'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// '2024-07-01' → '2024년 07월 01일 (월)'
export function formatMoveDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  // 'YYYY-MM-DD'를 new Date에 그대로 넣으면 UTC로 읽혀 날짜가 하루 밀릴 수 있다.
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${year}년 ${pad(month)}월 ${pad(day)}일 (${weekday})`
}

// '서울특별시 중구 세종대로 110' → '서울특별시 중구'
export function toShortAddress(address: string) {
  return address.split(' ').slice(0, 2).join(' ')
}

export function toCustomerName(request: ReceivedRequest) {
  return request.customerName ? `${request.customerName} 고객님` : '고객님'
}
