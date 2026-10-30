'use client'

import { Check } from 'lucide-react'
import { useId, useState, type ReactNode, type SubmitEvent } from 'react'
import Modal, { ModalButton, ModalField } from './Modal'
import SelectChip from '@/components/common/SelectChip'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { cn } from '@/lib/cn'

export type RequestFilter = {
  moveTypes: ServiceType[]
  designatedOnly: boolean
  serviceRegionOnly: boolean
}

export const DEFAULT_REQUEST_FILTER: RequestFilter = {
  moveTypes: [],
  designatedOnly: false,
  serviceRegionOnly: false,
}

export const FILTER_OPTIONS = [
  { key: 'designatedOnly', label: '지정 견적 요청' },
  { key: 'serviceRegionOnly', label: '서비스 가능 지역' },
] as const

// 고른 이사 유형이면 빼고, 아니면 더한다.
export function toggleMoveType(filter: RequestFilter, type: ServiceType) {
  return {
    ...filter,
    moveTypes: filter.moveTypes.includes(type)
      ? filter.moveTypes.filter((t) => t !== type)
      : [...filter.moveTypes, type],
  }
}

type FilterCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  className?: string
}

// 라벨 전체를 눌러도 체크된다. 데스크톱 받은 요청 페이지에서도 쓴다.
export function FilterCheckbox({
  checked,
  onChange,
  children,
  className,
}: FilterCheckboxProps) {
  return (
    <label
      className={cn(
        'flex w-fit cursor-pointer items-center gap-2 text-base text-black-400',
        className,
      )}
    >
      <span className="relative flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-5 cursor-pointer appearance-none rounded border border-gray-300 checked:border-primary-400 checked:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-white peer-checked:block"
        />
      </span>
      {children}
    </label>
  )
}

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
          {/* 모달 안에서는 화면 크기와 관계없이 작은 칩을 쓴다. */}
          {SERVICE_TYPE_OPTIONS.map(({ value, label }) => (
            <SelectChip
              key={value}
              selected={filter.moveTypes.includes(value)}
              onClick={() => setFilter((prev) => toggleMoveType(prev, value))}
              className="px-2.5 lg:h-9 lg:px-2.5 lg:text-sm"
            >
              {label}
            </SelectChip>
          ))}
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
          {/* 체크박스가 36px 영역 가운데에 오도록 왼쪽에 8px을 둔다. */}
          {FILTER_OPTIONS.map(({ key, label }) => (
            <FilterCheckbox
              key={key}
              checked={filter[key]}
              onChange={(checked) =>
                setFilter((prev) => ({ ...prev, [key]: checked }))
              }
              className="h-9 pl-2"
            >
              {label}
            </FilterCheckbox>
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
