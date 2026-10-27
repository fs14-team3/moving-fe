'use client'

import { Check } from 'lucide-react'
import { useId, useState, type SubmitEvent } from 'react'
import Modal, {
  MOVE_TYPE,
  ModalButton,
  ModalField,
  type MoveType,
} from './Modal'
import { cn } from '@/lib/cn'

export type RequestFilter = {
  moveTypes: MoveType[]
  designatedOnly: boolean
  serviceRegionOnly: boolean
}

const MOVE_TYPES = Object.keys(MOVE_TYPE) as MoveType[]

const OPTIONS = [
  { key: 'designatedOnly', label: '지정 견적 요청' },
  { key: 'serviceRegionOnly', label: '서비스 가능 지역' },
] as const

type FilterFormProps = {
  // 지금 적용된 필터. 모달을 열 때마다 이 값에서 시작한다.
  value: RequestFilter
  // 조회하기를 눌렀을 때만 호출된다. 모달 닫기는 부모가 한다.
  onSubmit: (filter: RequestFilter) => void
}

type FilterModalProps = FilterFormProps & {
  open: boolean
  onClose: () => void
}

function FilterForm({ value, onSubmit }: FilterFormProps) {
  const moveTypeLabelId = useId()
  const optionLabelId = useId()
  // 조회하기 전까지는 모달 안에서만 바꾸고, 목록에는 반영하지 않는다.
  const [filter, setFilter] = useState(value)

  const toggleMoveType = (type: MoveType) => {
    setFilter((prev) => ({
      ...prev,
      moveTypes: prev.moveTypes.includes(type)
        ? prev.moveTypes.filter((t) => t !== type)
        : [...prev.moveTypes, type],
    }))
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(filter)
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModalField
        label="이사 유형"
        labelId={moveTypeLabelId}
        className="mt-3 gap-2 md:mt-0"
      >
        <div
          role="group"
          aria-labelledby={moveTypeLabelId}
          className="flex flex-wrap gap-2.5"
        >
          {MOVE_TYPES.map((type) => {
            const selected = filter.moveTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleMoveType(type)}
                className={cn(
                  'h-9 rounded-full border px-2.5 text-sm font-medium',
                  selected
                    ? 'border-primary-400 bg-primary-100 text-primary-400'
                    : 'border-gray-200 bg-gray-100 text-black-300',
                )}
              >
                {MOVE_TYPE[type].label}
              </button>
            )
          })}
        </div>
      </ModalField>

      <ModalField
        label="지역 및 견적"
        labelId={optionLabelId}
        className="mt-7 gap-2"
      >
        <div
          role="group"
          aria-labelledby={optionLabelId}
          className="flex flex-col gap-3"
        >
          {OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex h-9 w-fit cursor-pointer items-center text-base text-black-400"
            >
              {/* 체크박스는 36px 영역 가운데에 둔다. */}
              <span className="relative flex size-9 items-center justify-center">
                <input
                  type="checkbox"
                  checked={filter[key]}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="peer size-5 cursor-pointer appearance-none rounded border border-gray-300 checked:border-primary-400 checked:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
                />
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-white peer-checked:block"
                />
              </span>
              {label}
            </label>
          ))}
        </div>
      </ModalField>

      <ModalButton type="submit">조회하기</ModalButton>
    </form>
  )
}

export default function FilterModal({
  open,
  onClose,
  ...formProps
}: FilterModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="필터">
      <FilterForm {...formProps} />
    </Modal>
  )
}
