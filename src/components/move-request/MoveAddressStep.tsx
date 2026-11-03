import { useState } from 'react'
import Button from '../common/button/Button'
import AddressSearchModal, {
  type AddressField,
  type SelectedAddress,
} from './AddressSearchModal'

type MoveAddressStepProps = {
  departureAddress: SelectedAddress | null
  arrivalAddress: SelectedAddress | null
  onDepartureChange: (address: SelectedAddress) => void
  onArrivalChange: (address: SelectedAddress) => void
}

export default function MoveAddressStep({
  departureAddress,
  arrivalAddress,
  onDepartureChange,
  onArrivalChange,
}: MoveAddressStepProps) {
  const [activeField, setActiveField] = useState<AddressField | null>(null)

  function handleAddressSelect(address: SelectedAddress) {
    if (activeField === 'departure') {
      onDepartureChange(address)
    }

    if (activeField === 'arrival') {
      onArrivalChange(address)
    }

    setActiveField(null)
  }

  return (
    <div className="flex flex-col gap-6 md:gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-base leading-6 font-medium">출발지</p>
        <Button
          variant="outlined"
          type="button"
          onClick={() => setActiveField('departure')}
          className="w-full cursor-pointer justify-start truncate px-6 py-4 md:w-100 lg:w-100"
        >
          <span className="truncate">
            {departureAddress?.address || '출발지 선택하기'}
          </span>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-base leading-6 font-medium">도착지</p>
        <Button
          variant="outlined"
          type="button"
          onClick={() => setActiveField('arrival')}
          className="w-full cursor-pointer justify-start truncate px-6 py-4 md:w-100 lg:w-100"
        >
          <span className="truncate">
            {arrivalAddress?.address || '도착지 선택하기'}
          </span>
        </Button>
      </div>

      <AddressSearchModal
        open={activeField !== null}
        addressField={activeField ?? 'departure'}
        onClose={() => setActiveField(null)}
        onSelect={handleAddressSelect}
      />
    </div>
  )
}
