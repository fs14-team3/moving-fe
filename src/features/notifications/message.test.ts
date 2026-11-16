import { describe, expect, it } from 'vitest'
import type { Notification } from '@/features/notifications/api'
import { toAreaLabel, toMessageParts } from '@/features/notifications/message'

function createNotification(
  type: Notification['type'],
  payload: Notification['payload'],
): Notification {
  return {
    id: 'notification-1',
    userId: 'user-1',
    type,
    message: null,
    payload,
    readAt: null,
    createdAt: '2026-11-10T00:00:00.000Z',
  }
}

function toText(parts: ReturnType<typeof toMessageParts>) {
  return parts?.map(({ text }) => text).join('')
}

function toHighlight(parts: ReturnType<typeof toMessageParts>) {
  return parts?.find(({ highlight }) => highlight)?.text
}

describe('toMessageParts', () => {
  it('새 견적 알림은 기사님 별명과 이사 종류로 만든다', () => {
    const parts = toMessageParts(
      createNotification('NEW_QUOTE', {
        moverNickname: '김코드',
        moveType: 'SMALL',
      }),
      'CUSTOMER',
    )

    expect(toText(parts)).toBe('김코드 기사님의 소형이사 견적이 도착했어요')
    expect(toHighlight(parts)).toBe('소형이사 견적')
  })

  it.each([
    ['NEW_REQUEST', '김가나 고객님의 가정이사 견적 요청이 도착했어요'],
    [
      'NEW_DESIGNATED_REQUEST',
      '김가나 고객님의 가정이사 지정 견적 요청이 도착했어요',
    ],
  ] as const)('%s 알림은 고객 이름과 이사 종류로 만든다', (type, text) => {
    const parts = toMessageParts(
      createNotification(type, { customerName: '김가나', moveType: 'HOME' }),
      'MOVER',
    )

    expect(toText(parts)).toBe(text)
  })

  it('견적 확정 알림은 받는 사람 기준으로 상대방 이름을 쓴다', () => {
    const notification = createNotification('QUOTE_CONFIRMED', {
      moveType: 'OFFICE',
      customerName: '김가나',
      moverNickname: '김코드',
    })

    expect(toText(toMessageParts(notification, 'CUSTOMER'))).toBe(
      '김코드 기사님의 견적이 확정되었어요',
    )
    expect(toText(toMessageParts(notification, 'MOVER'))).toBe(
      '김가나 고객님이 견적을 확정했어요',
    )
    expect(toHighlight(toMessageParts(notification, 'MOVER'))).toBe('확정')
  })

  it('이사 전날 알림은 출발지 · 도착지를 줄여서 보여 준다', () => {
    const parts = toMessageParts(
      createNotification('MOVE_DAY', {
        moveType: 'SMALL',
        fromAddress: '경기도 고양시 일산동구 중앙로 1',
        toAddress: '서울특별시 영등포구 여의대로 1',
      }),
      'CUSTOMER',
    )

    expect(toText(parts)).toBe(
      '내일은 경기(고양) → 서울(영등포) 이사 예정일이에요.',
    )
  })

  it('필요한 값이 없으면 null을 돌려준다', () => {
    expect(
      toMessageParts(
        createNotification('NEW_QUOTE', { moveType: 'SMALL' }),
        'CUSTOMER',
      ),
    ).toBeNull()
    expect(
      toMessageParts(
        createNotification('QUOTE_CONFIRMED', { moverNickname: '김코드' }),
        'MOVER',
      ),
    ).toBeNull()
  })
})

describe('toAreaLabel', () => {
  it.each([
    ['서울 영등포구 여의대로 1', '서울(영등포)'],
    ['서울특별시 중구 세종대로 110', '서울(중구)'],
    ['세종특별자치시 한누리대로 2130', '세종'],
  ])('%s → %s', (address, label) => {
    expect(toAreaLabel(address)).toBe(label)
  })
})
