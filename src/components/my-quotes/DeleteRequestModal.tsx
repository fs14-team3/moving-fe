'use client'

import ConfirmModal from '@/components/common/modal/ConfirmModal'

type DeleteRequestModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export default function DeleteRequestModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteRequestModalProps) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      isPending={isDeleting}
      title="견적 요청 삭제"
      confirmLabel="삭제하기"
    >
      견적 요청을 삭제할까요?
      <br />
      삭제한 요청은 되돌릴 수 없어요.
    </ConfirmModal>
  )
}
