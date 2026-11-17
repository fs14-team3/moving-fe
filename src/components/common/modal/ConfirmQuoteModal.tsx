'use client'

import ConfirmModal from './ConfirmModal'

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
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      isPending={isConfirming}
      title="견적 확정"
      confirmLabel="확정하기"
    >
      견적을 확정하면 다른 견적을 선택할 수 없어요.
      <br />이 견적으로 확정할까요?
    </ConfirmModal>
  )
}
