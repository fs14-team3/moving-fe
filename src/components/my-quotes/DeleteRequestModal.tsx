'use client'

import Modal, { ModalButton } from '@/components/common/modal/Modal'

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="견적 요청 삭제"
      mobileSheet={false}
    >
      <p className="text-sm text-black-200 md:text-base">
        견적 요청을 삭제할까요?
        <br />
        삭제한 요청은 되돌릴 수 없어요.
      </p>
      <ModalButton onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? '삭제 중...' : '삭제하기'}
      </ModalButton>
    </Modal>
  )
}
