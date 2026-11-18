'use client'

import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'

type ChatMessageInputProps = {
  disabled?: boolean
  onSend: (content: string) => void
}

export default function ChatMessageInput({
  disabled = false,
  onSend,
}: ChatMessageInputProps) {
  const [content, setContent] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent || disabled) return

    onSend(trimmedContent)
    setContent('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 border-t border-line-100 bg-white px-4 py-4 md:px-6"
    >
      <textarea
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
