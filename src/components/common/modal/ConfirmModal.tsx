'use client'

import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import Modal, { ModalButton } from './Modal'

const BUTTON = 'mt-0 flex-1 md:mt-0'

type ConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  confirmLabel: string
  isPending?: boolean
  children: ReactNode
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  isPending = false,
  children,
}: ConfirmModalProps) {
  const close = isPending ? () => {} : onClose

  return (
    <Modal open={open} onClose={close} title={title} mobileSheet={false}>
      <p className="text-sm text-black-200 md:text-base">{children}</p>
      <div className="mt-8 flex gap-2 md:mt-10 md:gap-3">
        <ModalButton
          variant="outlined"
          done
          disabled={isPending}
          onClick={onClose}
          className={BUTTON}
        >
          취소
        </ModalButton>
        <ModalButton
          onClick={onConfirm}
          disabled={isPending}
          aria-busy={isPending || undefined}
          icon={
            isPending && (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            )
          }
          className={BUTTON}
        >
          {confirmLabel}
        </ModalButton>
      </div>
    </Modal>
  )
}
