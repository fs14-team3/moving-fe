import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '@/features/chat/types'
import ChatMessageList from './ChatMessageList'

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()

  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

vi.mock('next/image', () => ({
  default: ({
    fill,
    unoptimized,
    ...props
  }: React.ComponentProps<'img'> & {
    fill?: boolean
    unoptimized?: boolean
  }) => {
    void fill
    void unoptimized

    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ''} />
  },
}))

const messages: ChatMessage[] = [
  {
    id: 'message-1',
    chatRoomId: 'chat-room-1',
    senderId: 'user-1',
    senderName: '나',
    content: '사진을 확인해 주세요.',
    createdAt: '2026-11-27T09:00:00.000Z',
    images: [
      {
        id: 'image-1',
        url: 'https://example.com/image-1.jpg',
        contentType: 'image/jpeg',
        createdAt: '2026-11-27T09:00:00.000Z',
      },
      {
        id: 'image-2',
        url: 'https://example.com/image-2.jpg',
        contentType: 'image/jpeg',
        createdAt: '2026-11-27T09:00:00.000Z',
      },
    ],
  },
]

describe('ChatMessageList', () => {
  it('메시지 내용과 첨부 이미지 썸네일을 표시한다', () => {
    render(<ChatMessageList messages={messages} currentUserId="user-1" />)

    expect(screen.getByText('사진을 확인해 주세요.')).toBeInTheDocument()
    expect(screen.getByAltText('첨부 이미지 1')).toBeInTheDocument()
    expect(screen.getByAltText('첨부 이미지 2')).toBeInTheDocument()
  })

  it('이미지 전용 메시지는 빈 텍스트 대신 이미지를 표시한다', () => {
    const imageOnlyMessages = [{ ...messages[0], content: '' }]

    render(
      <ChatMessageList messages={imageOnlyMessages} currentUserId="user-1" />,
    )

    expect(
      screen.getByRole('button', { name: '첨부 이미지 1 크게 보기' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('사진을 확인해 주세요.')).not.toBeInTheDocument()
  })

  it('이미지를 누르면 확대 모달을 열고 다음 이미지로 이동한다', () => {
    render(<ChatMessageList messages={messages} currentUserId="user-1" />)

    fireEvent.click(
      screen.getByRole('button', { name: '첨부 이미지 1 크게 보기' }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '다음 이미지' }))

    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(
      screen.getAllByRole('img', { name: '첨부 이미지 2' })[1],
    ).toBeInTheDocument()
  })

  it('첫 이미지에서는 이전 버튼을 표시하지 않는다', () => {
    render(<ChatMessageList messages={messages} currentUserId="user-1" />)

    fireEvent.click(
      screen.getByRole('button', { name: '첨부 이미지 1 크게 보기' }),
    )

    expect(
      screen.queryByRole('button', { name: '이전 이미지' }),
    ).not.toBeInTheDocument()
  })
})
