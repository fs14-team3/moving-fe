'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import Image from 'next/image'
import { ImagePlus, Send, Smile, X } from 'lucide-react'
import { getImageFileError } from '@/features/profile/lib/validation'

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
  onSend: (content: string, files: File[]) => Promise<void>
}

export default function ChatMessageInput({
  disabled = false,
  onSend,
}: ChatMessageInputProps) {
  const [content, setContent] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const previewUrlsRef = useRef<string[]>([])
  const [fileError, setFileError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const pendingCursorPositionRef = useRef<number | null>(null)

  const emojiPickerId = useId()
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

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

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setFileError('')

    const remainingCount = 5 - selectedFiles.length

    if (files.length > remainingCount) {
      setFileError('이미지는 최대 5장까지 첨부할 수 있습니다.')
      event.target.value = ''
      return
    }

    const invalidFile = files.find(getImageFileError)

    if (invalidFile) {
      setFileError(getImageFileError(invalidFile) ?? '')
      event.target.value = ''
      return
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))

    setSelectedFiles((previous) => [...previous, ...files])
    setPreviewUrls((previous) => [...previous, ...newPreviewUrls])
    previewUrlsRef.current = [...previewUrlsRef.current, ...newPreviewUrls]

    event.target.value = ''
  }

  function handleFileRemove(index: number) {
    const removedUrl = previewUrls[index]

    if (removedUrl) {
      URL.revokeObjectURL(removedUrl)
    }

    const nextPreviewUrls = previewUrls.filter(
      (_, fileIndex) => fileIndex !== index,
    )

    previewUrlsRef.current = nextPreviewUrls
    setPreviewUrls(nextPreviewUrls)

    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    )

    setFileError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (
      (!trimmedContent && selectedFiles.length === 0) ||
      disabled ||
      isSubmitting
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSend(trimmedContent, selectedFiles)

      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })

      previewUrlsRef.current = []
      setPreviewUrls([])
      setContent('')
      setSelectedFiles([])
      setFileError('')
      setIsEmojiPickerOpen(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-3 border-t border-line-100 bg-white px-4 py-4 md:px-6"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      {(selectedFiles.length > 0 || fileError) && (
        <div className="absolute right-0 bottom-full left-0 mb-2 flex flex-col gap-2">
          {fileError && (
            <p role="alert" className="px-4 text-sm text-red-500">
              {fileError}
            </p>
          )}

          {selectedFiles.length > 0 &&
            previewUrls.length === selectedFiles.length && (
              <div className="flex flex-wrap gap-2 px-4">
                {previewUrls.map((previewUrl, index) => (
                  <div
                    key={`${selectedFiles[index].name}-${selectedFiles[index].lastModified}-${index}`}
                    className="relative size-16"
                  >
                    <Image
                      src={previewUrl}
                      alt={`첨부 이미지 ${index + 1}`}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-16 rounded-lg border border-line-200 object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`첨부 이미지 ${index + 1} 삭제`}
                      onClick={() => handleFileRemove(index)}
                      className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-black-400 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
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
      <button
        type="button"
        disabled={disabled || isSubmitting || selectedFiles.length >= 5}
        onClick={() => fileInputRef.current?.click()}
        aria-label="이미지 첨부"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-200 text-gray-500 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImagePlus size={20} />
      </button>
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
        disabled={
          disabled ||
          isSubmitting ||
          (!content.trim() && selectedFiles.length === 0)
        }
        aria-label="메시지 전송"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-400 text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send size={18} />
      </button>
    </form>
  )
}
