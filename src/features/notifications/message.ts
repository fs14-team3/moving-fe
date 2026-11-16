import type { Role } from '@/features/auth/types'
import type { Notification } from '@/features/notifications/api'
import { getServiceTypeLabel, type ServiceType } from '@/constants/services'

// 알림 문구 조각. highlight는 시안에서 주황색으로 강조하는 부분이다.
export type MessagePart = { text: string; highlight?: boolean }

const SIDO_SHORT: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원도: '강원',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라북도: '전북',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
}

function readString(payload: Notification['payload'], key: string) {
  const value = payload[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

// '서울특별시 영등포구 여의대로 1' → '서울(영등포)'
// 세종시처럼 시 · 군 · 구가 없으면 시 · 도만, '중구'처럼 두 글자면 그대로 둔다.
export function toAreaLabel(address: string) {
  const [sido, sigungu = ''] = address.trim().split(/\s+/)
  const area = SIDO_SHORT[sido] ?? sido
  if (!/(시|군|구)$/.test(sigungu)) return area
  const district = sigungu.length > 2 ? sigungu.slice(0, -1) : sigungu
  return `${area}(${district})`
}

// BE가 payload에 담아 준 값으로 시안 문구를 만든다. 필요한 값이 없으면 null을 돌려준다.
// 견적 확정 알림은 고객 · 기사님 이름이 모두 오므로, 받는 사람 기준으로 상대방 이름을 쓴다.
export function toMessageParts(
  notification: Notification,
  role: Role,
): MessagePart[] | null {
  const { payload } = notification
  const moveType = readString(payload, 'moveType')
  const moveTypeLabel = moveType && getServiceTypeLabel(moveType as ServiceType)
  const customerName = readString(payload, 'customerName')
  const moverNickname = readString(payload, 'moverNickname')

  switch (notification.type) {
    case 'NEW_QUOTE':
      if (!moverNickname || !moveTypeLabel) return null
      return [
        { text: `${moverNickname} 기사님의 ` },
        { text: `${moveTypeLabel} 견적`, highlight: true },
        { text: '이 도착했어요' },
      ]
    case 'NEW_REQUEST':
    case 'NEW_DESIGNATED_REQUEST': {
      if (!customerName || !moveTypeLabel) return null
      const request =
        notification.type === 'NEW_DESIGNATED_REQUEST'
          ? '지정 견적 요청'
          : '견적 요청'
      return [
        { text: `${customerName} 고객님의 ` },
        { text: `${moveTypeLabel} ${request}`, highlight: true },
        { text: '이 도착했어요' },
      ]
    }
    case 'QUOTE_CONFIRMED':
      if (role === 'MOVER') {
        if (!customerName) return null
        return [
          { text: `${customerName} 고객님이 견적을 ` },
          { text: '확정', highlight: true },
          { text: '했어요' },
        ]
      }
      if (!moverNickname) return null
      return [
        { text: `${moverNickname} 기사님의 견적이 ` },
        { text: '확정', highlight: true },
        { text: '되었어요' },
      ]
    case 'MOVE_DAY': {
      const from = readString(payload, 'fromAddress')
      const to = readString(payload, 'toAddress')
      if (!from || !to) return null
      return [
        { text: '내일은 ' },
        {
          text: `${toAreaLabel(from)} → ${toAreaLabel(to)} 이사 예정일`,
          highlight: true,
        },
        { text: '이에요.' },
      ]
    }
    default:
      return null
  }
}
