import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatMessageInput from '@/components/chat/ChatMessageInput'

describe('ChatMessageInput', () => {
  it('이모지 버튼을 누르면 선택 팝업을 연다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))

    expect(
      screen.getByRole('group', { name: '이모지 선택' }),
    ).toBeInTheDocument()
  })

  it('선택한 이모지를 입력창에 삽입한다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))
    await user.click(screen.getByRole('button', { name: '😀 이모지 삽입' }))

    expect(screen.getByPlaceholderText('메시지를 입력해 주세요.')).toHaveValue(
      '😀',
    )
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('기존 텍스트의 커서 위치에 이모지를 삽입한다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(
      '메시지를 입력해 주세요.',
    ) as HTMLTextAreaElement

    await user.type(textarea, '안녕하세요')
    textarea.setSelectionRange(2, 2)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))
    await user.click(screen.getByRole('button', { name: '😀 이모지 삽입' }))

    expect(textarea).toHaveValue('안녕😀하세요')
    expect(textarea).toHaveFocus()
    expect(textarea.selectionStart).toBe(4)
    expect(textarea.selectionEnd).toBe(4)
  })

  it('팝업 바깥을 클릭하면 팝업을 닫는다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))
    expect(screen.getByRole('group')).toBeInTheDocument()

    await user.click(document.body)

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('이모지만 입력해도 메시지를 전송한다', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatMessageInput onSend={onSend} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))
    await user.click(screen.getByRole('button', { name: '😀 이모지 삽입' }))
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).toHaveBeenCalledWith('😀', [])
  })

  it('비활성화 상태에서는 이모지 팝업을 열 수 없다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput disabled onSend={vi.fn()} />)

    const emojiButton = screen.getByRole('button', { name: '이모지 선택' })

    expect(emojiButton).toBeDisabled()

    await user.click(emojiButton)

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('이모지 버튼을 다시 누르면 팝업을 닫는다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const emojiButton = screen.getByRole('button', { name: '이모지 선택' })

    await user.click(emojiButton)
    expect(screen.getByRole('group')).toBeInTheDocument()

    await user.click(emojiButton)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('입력 내용이 비어 있으면 메시지를 전송하지 않는다', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatMessageInput onSend={onSend} />)

    expect(screen.getByRole('button', { name: '메시지 전송' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).not.toHaveBeenCalled()
  })

  it('이모지 버튼에 포커스가 있어도 Escape를 누르면 팝업을 닫고 버튼으로 포커스를 돌려준다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const emojiButton = screen.getByRole('button', { name: '이모지 선택' })

    await user.click(emojiButton)

    expect(
      screen.getByRole('group', { name: '이모지 선택' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('group', { name: '이모지 선택' }),
    ).not.toBeInTheDocument()
    expect(emojiButton).toHaveFocus()
  })

  it('여러 입력창이 렌더링되어도 이모지 팝업 ID가 중복되지 않는다', async () => {
    const user = userEvent.setup()

    render(
      <>
        <ChatMessageInput onSend={vi.fn()} />
        <ChatMessageInput onSend={vi.fn()} />
      </>,
    )

    const emojiButtons = screen.getAllByRole('button', { name: '이모지 선택' })

    const firstId = emojiButtons[0].getAttribute('aria-controls')
    const secondId = emojiButtons[1].getAttribute('aria-controls')

    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
    expect(firstId).not.toBe(secondId)

    await user.click(emojiButtons[0])
    expect(document.getElementById(firstId!)).toBeInTheDocument()

    await user.click(emojiButtons[0])
    await user.click(emojiButtons[1])
    expect(document.getElementById(secondId!)).toBeInTheDocument()
  })

  it('이미지 첨부 버튼을 누르면 파일 선택창을 열 수 있다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    const clickSpy = vi.spyOn(fileInput, 'click')

    await user.click(screen.getByRole('button', { name: '이미지 첨부' }))

    expect(clickSpy).toHaveBeenCalled()
  })

  it('이미지를 선택하면 미리보기를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(fileInput, file)

    expect(
      await screen.findByRole('img', { name: '첨부 이미지 1' }),
    ).toBeInTheDocument()
  })

  it('지원하지 않는 이미지 형식은 첨부하지 않는다', async () => {
    render(<ChatMessageInput onSend={vi.fn()} />)

    const file = new File(['image'], 'photo.gif', { type: 'image/gif' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    fireEvent.change(fileInput, {
      target: { files: [file] },
    })

    expect(
      screen.queryByRole('img', { name: '첨부 이미지 1' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('JPG, PNG, WEBP 이미지를 선택해 주세요.'),
    ).toBeInTheDocument()
  })

  it('5MB를 초과하는 이미지는 첨부하지 않는다', async () => {
    render(<ChatMessageInput onSend={vi.fn()} />)

    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    fireEvent.change(fileInput, {
      target: { files: [file] },
    })

    expect(
      screen.queryByRole('img', { name: '첨부 이미지 1' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('5MB 이하의 이미지를 선택해 주세요.'),
    ).toBeInTheDocument()
  })

  it('이미지만 선택해도 메시지를 전송한다', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<ChatMessageInput onSend={onSend} />)

    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(fileInput, file)
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).toHaveBeenCalledWith('', [file])
  })

  it('선택한 이미지를 개별 삭제할 수 있다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(fileInput, file)

    expect(
      await screen.findByRole('img', { name: '첨부 이미지 1' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '첨부 이미지 1 삭제' }))

    expect(
      screen.queryByRole('img', { name: '첨부 이미지 1' }),
    ).not.toBeInTheDocument()
  })
})
