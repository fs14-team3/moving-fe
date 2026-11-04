import { useEffect } from 'react'
import KakaoPostcodeEmbed, {
  loadPostcode,
  type Address,
} from 'react-daum-postcode'
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
  useEffect(() => {
    void loadPostcode().catch(() => {
      // 오류 문구는 KakaoPostcodeEmbed의 errorMessage에서 표시
    })
  }, [])

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
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
    }

    onSelect({ address: fullAddress, zonecode: data.zonecode })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="shadow-[4px_4px_10px_0_rgba(169,169,169,0.20)]"
    >
      <KakaoPostcodeEmbed
        style={{ height: 400 }}
        onComplete={handleComplete}
        errorMessage={
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center text-sm leading-6 text-gray-400"
          >
            <p>주소 검색을 불러오지 못했습니다.</p>
            <p>잠시 후 다시 시도해 주세요.</p>
          </div>
        }
      />
    </Modal>
  )
}
