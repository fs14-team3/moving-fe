import { useState } from 'react'
import Button from '../common/button/Button'
import AddressSearchModal, { type AddressField } from './AddressSearchModal'

export default function MoveAddressStep() {
  const [activeField, setActiveField] = useState<AddressField | null>(null)

  return (
    <div className="flex flex-col gap-6 md:gap-4 lg:flex-row">
      <div className="flex flex-col gap-3">
        <p className="text-base leading-6 font-medium">출발지</p>
        <Button
          variant="outlined"
          type="button"
          onClick={() => setActiveField('departure')}
          className="w-full cursor-pointer justify-start px-6 py-4 md:w-100 lg:w-[252px]"
        >
          출발지 선택하기
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-base leading-6 font-medium">도착지</p>
        <Button
          variant="outlined"
          type="button"
          onClick={() => setActiveField('arrival')}
          className="w-full cursor-pointer justify-start px-6 py-4 md:w-100 lg:w-[252px]"
        >
          도착지 선택하기
        </Button>
      </div>

      <AddressSearchModal
        open={activeField !== null}
        addressField={activeField ?? 'departure'}
        onClose={() => setActiveField(null)}
        onSelect={(address) => {}}
      />
    </div>
  )
}
