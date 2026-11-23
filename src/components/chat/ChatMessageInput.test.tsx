import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatMessageInput from '@/components/chat/ChatMessageInput'

describe('ChatMessageInput', () => {
  it('이모지 버튼을 누르면 선택 팝업을 연다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))

    expect(
      screen.getByRole('dialog', { name: '이모지 선택' }),
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
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
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
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(document.body)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('이모지만 입력해도 메시지를 전송한다', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatMessageInput onSend={onSend} />)

    await user.click(screen.getByRole('button', { name: '이모지 선택' }))
    await user.click(screen.getByRole('button', { name: '😀 이모지 삽입' }))
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).toHaveBeenCalledWith('😀')
  })

  it('비활성화 상태에서는 이모지 팝업을 열 수 없다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput disabled onSend={vi.fn()} />)

    const emojiButton = screen.getByRole('button', { name: '이모지 선택' })

    expect(emojiButton).toBeDisabled()

    await user.click(emojiButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('이모지 버튼을 다시 누르면 팝업을 닫는다', async () => {
    const user = userEvent.setup()
    render(<ChatMessageInput onSend={vi.fn()} />)

    const emojiButton = screen.getByRole('button', { name: '이모지 선택' })

    await user.click(emojiButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(emojiButton)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('입력 내용이 비어 있으면 메시지를 전송하지 않는다', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatMessageInput onSend={onSend} />)

    expect(screen.getByRole('button', { name: '메시지 전송' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).not.toHaveBeenCalled()
  })
})
