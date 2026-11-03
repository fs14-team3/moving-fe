import KakaoPostcodeEmbed, { type Address } from 'react-daum-postcode'
import Modal from '../common/modal/Modal'

export type AddressField = 'departure' | 'arrival'

export type SelectedAddress = {
  address: string
  zonecode: string
}

type AddressSearchModalProps = {
  open: boolean
  addressField: AddressField
  onClose: () => void
  onSelect: ({ address, zonecode }: SelectedAddress) => void
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

  function handleComplete(data: Address) {
    let fullAddress = data.address
    let extraAddress = ''

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname
      }
      if (data.buildingName !== '') {
        extraAddress +=
          extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
      }
      fullAddress += extraAddress !== '' ? `(${extraAddress})` : ''
    }

    onSelect({ address: fullAddress, zonecode: data.zonecode })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      mobileSheet={false}
      className="h-[446px] shadow-[4px_4px_10px_0_rgba(169,169,169,0.20)]"
    >
      <KakaoPostcodeEmbed onComplete={handleComplete} />
    </Modal>
  )
}
