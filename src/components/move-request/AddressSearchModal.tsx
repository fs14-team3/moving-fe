import Modal from '../common/modal/Modal'

export type AddressField = 'departure' | 'arrival'

type AddressSearchModalProps = {
  open: boolean
  addressField: AddressField
  onClose: () => void
  onSelect: (address: string) => void
}

export default function AddressSearchModal({
  open,
  addressField,
  onClose,
  onSelect,
}: AddressSearchModalProps) {
  const title =
    addressField === 'departure'
      ? '출발지를 입력해주세요'
      : '도착지를 입력해주세요'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      mobileSheet={false}
      className="h-[446px] shadow-[4px_4px_10px_0_rgba(169,169,169,0.20)]"
    >
      {`TODO: 카카오 우편번호 연동`}
    </Modal>
  )
}
