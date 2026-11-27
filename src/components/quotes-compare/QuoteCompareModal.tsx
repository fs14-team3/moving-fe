'use client'

import { CustomerQuote } from '@/features/my-quotes/api'
import Modal from '../common/modal/Modal'
import QuoteCompareStep from './QuoteCompareStep'

type ModalProps = {
  open: boolean
  onClose: () => void
  requestId: string
  pendingQuotes: CustomerQuote[]
}

export default function QuoteCompareModal({
  open,
  onClose,
  requestId,
  pendingQuotes,
}: ModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="견적을 비교하고 추천해 드려요"
      titleClassName="text-xl"
      className="lg:w-200"
    >
      <QuoteCompareStep requestId={requestId} pendingQuotes={pendingQuotes} />
    </Modal>
  )
}
