'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  // false면 모바일에서도 바텀시트 대신 가운데 모달로 보여준다.
  mobileSheet?: boolean
  className?: string
}

// dialog의 padding은 0으로 두고 안쪽 div에 준다. dialog 자체를 클릭했다면 배경을 누른 것이다.
const BASE =
  'max-h-[90dvh] max-w-none overflow-y-auto bg-white p-0 text-black-400 backdrop:bg-black/50'

// 모바일: 화면 아래에 붙는 바텀시트 / 태블릿 이상: 가운데 모달
const SHEET =
  'mx-0 mt-auto mb-0 w-full rounded-t-3xl md:m-auto md:w-100 md:rounded-3xl lg:w-152'
const CENTER = 'm-auto w-[calc(100%-48px)] rounded-3xl md:w-100 lg:w-152'

export default function Modal({
  open,
  onClose,
  title,
  children,
  mobileSheet = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // 모달이 열려 있는 동안 뒤 페이지가 스크롤되지 않게 막는다.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // ESC를 누르면 브라우저가 dialog를 직접 닫기 때문에, 막고 open 상태를 부모가 바꾸게 한다.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={cn(BASE, mobileSheet ? SHEET : CENTER, className)}
    >
      <div className="px-6 pt-6 pb-8 lg:px-8 lg:pt-8 lg:pb-10">
        <div className="mb-6 flex items-center justify-between lg:mb-8">
          <h2 id={titleId} className="text-lg font-bold lg:text-2xl">
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="text-gray-400"
          >
            <X className="size-6 lg:size-9" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
