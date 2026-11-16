'use client'

import { LoaderCircle } from 'lucide-react'
import Modal, { ModalButton } from '@/components/common/modal/Modal'

const BUTTON = 'mt-0 flex-1 md:mt-0'

type DeleteRequestModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

// 진행 중인 견적 요청을 삭제하기 전에 한 번 더 확인한다.
export default function DeleteRequestModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteRequestModalProps) {
  // 삭제하는 중에는 닫아도 요청이 계속 진행되므로, 끝날 때까지 닫지 않는다.
  const close = isDeleting ? () => {} : onClose

  return (
    <Modal
      open={open}
      onClose={close}
      title="견적 요청 삭제"
      mobileSheet={false}
    >
      <p className="text-sm text-black-200 md:text-base">
        견적 요청을 삭제할까요?
        <br />
        삭제한 요청은 되돌릴 수 없어요.
      </p>
      <div className="mt-8 flex gap-2 md:mt-10 md:gap-3">
        <ModalButton
          variant="outlined"
          done
          disabled={isDeleting}
          onClick={onClose}
          className={BUTTON}
        >
          취소
        </ModalButton>
        <ModalButton
          onClick={onConfirm}
          disabled={isDeleting}
          aria-busy={isDeleting || undefined}
          icon={
            isDeleting && (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
            )
          }
          className={BUTTON}
        >
          삭제하기
        </ModalButton>
      </div>
    </Modal>
  )
}
