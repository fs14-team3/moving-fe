'use client'

import { LoaderCircle } from 'lucide-react'
import Modal, { ModalButton } from './Modal'

const BUTTON = 'mt-0 flex-1 md:mt-0'

type ConfirmQuoteModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isConfirming: boolean
}

export default function ConfirmQuoteModal({
  open,
  onClose,
  onConfirm,
  isConfirming,
}: ConfirmQuoteModalProps) {
  const close = isConfirming ? () => {} : onClose

  return (
    <Modal open={open} onClose={close} title="견적 확정" mobileSheet={false}>
      <p className="text-sm text-black-200 md:text-base">
        견적을 확정하면 다른 견적을 선택할 수 없어요.
        <br />이 견적으로 확정할까요?
      </p>
      <div className="mt-8 flex gap-2 md:mt-10 md:gap-3">
        <ModalButton
          variant="outlined"
          done
          disabled={isConfirming}
          onClick={onClose}
          className={BUTTON}
        >
          취소
        </ModalButton>
        <ModalButton
          onClick={onConfirm}
          disabled={isConfirming}
          aria-busy={isConfirming || undefined}
          icon={
            isConfirming && (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            )
          }
          className={BUTTON}
        >
          확정하기
        </ModalButton>
      </div>
    </Modal>
  )
}
