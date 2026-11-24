'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Send, Smile } from 'lucide-react'

const EMOJIS = [
  '😀',
  '😄',
  '😁',
  '😂',
  '🤣',
  '😊',
  '🥰',
  '😍',
  '😘',
  '😎',
  '🤔',
  '🥳',
  '😭',
  '😢',
  '😡',
  '👍',
  '👎',
  '👏',
  '🙏',
  '❤️',
  '💕',
  '🔥',
  '🎉',
  '💪',
  '🚚',
  '🏠',
  '📦',
  '✨',
]

type ChatMessageInputProps = {
  disabled?: boolean
  onSend: (content: string) => void
}

export default function ChatMessageInput({
  disabled = false,
  onSend,
}: ChatMessageInputProps) {
  const [content, setContent] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const pendingCursorPositionRef = useRef<number | null>(null)

  const emojiPickerId = useId()
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isEmojiPickerOpen) return

    function handleOutsideClick(event: PointerEvent) {
      if (!emojiPickerRef.current?.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      setIsEmojiPickerOpen(false)
      emojiButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEmojiPickerOpen])

  useEffect(() => {
    const cursorPosition = pendingCursorPositionRef.current

    if (cursorPosition === null) return

    textareaRef.current?.focus()
    textareaRef.current?.setSelectionRange(cursorPosition, cursorPosition)

    pendingCursorPositionRef.current = null
  }, [content])

  function handleEmojiSelect(emoji: string) {
    const textarea = textareaRef.current

    if (!textarea) return

    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    const nextContent =
      content.slice(0, selectionStart) + emoji + content.slice(selectionEnd)

    if (nextContent.length > 1000) return

    pendingCursorPositionRef.current = selectionStart + emoji.length

    setContent(nextContent)
    setIsEmojiPickerOpen(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent || disabled) return

    onSend(trimmedContent)
    setContent('')
    setIsEmojiPickerOpen(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 border-t border-line-100 bg-white px-4 py-4 md:px-6"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }}
        disabled={disabled}
        rows={1}
        maxLength={1000}
        placeholder="메시지를 입력해 주세요."
        className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-line-200 bg-background-100 px-4 py-3 text-sm text-black-400 outline-none placeholder:text-gray-400 focus:border-primary-300 disabled:bg-background-200"
      />

      <div ref={emojiPickerRef} className="relative shrink-0">
        <button
          ref={emojiButtonRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
          aria-label="이모지 선택"
          aria-expanded={isEmojiPickerOpen}
          aria-controls={emojiPickerId}
          className="flex size-11 items-center justify-center rounded-xl border border-line-200 text-gray-500 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Smile size={20} />
        </button>

        {isEmojiPickerOpen && (
          <div
            id={emojiPickerId}
            role="group"
            aria-label="이모지 선택"
            className="absolute right-0 bottom-full z-50 mb-2 grid w-64 grid-cols-6 gap-1 rounded-xl border border-line-200 bg-white p-3 shadow-lg"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                aria-label={`${emoji} 이모지 삽입`}
                className="flex size-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-background-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !content.trim()}
        aria-label="메시지 전송"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-400 text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send size={18} />
      </button>
    </form>
  )
}
