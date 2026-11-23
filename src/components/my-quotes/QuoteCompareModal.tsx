'use client'

import { CustomerQuote } from '@/features/my-quotes/api'
import Modal from '../common/modal/Modal'
import QuoteCompareSelect from './QuoteCompareSelect'

type ModalProps = {
  open: boolean
  onClose: () => void
  pendingQuotes: CustomerQuote[]
}

export default function QuoteCompareModal({
  open,
  onClose,
  pendingQuotes,
}: ModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="견적을 비교하고 추천해 드려요"
      titleClassName="text-xl"
      className="m-0 h-dvh max-h-dvh w-full rounded-none md:m-auto md:h-auto md:max-h-[90dvh] md:rounded-4xl lg:w-200"
    >
      <QuoteCompareSelect pendingQuotes={pendingQuotes} />
    </Modal>
  )
}
