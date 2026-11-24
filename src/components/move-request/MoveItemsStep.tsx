import { useId, useState } from 'react'
import QuantityStepper from '@/components/common/QuantityStepper'
import SelectChip from '@/components/common/SelectChip'
import {
  BOX_RANGE_OPTIONS,
  MOVE_ITEM_CATEGORIES,
  type MoveItem,
} from '@/constants/moveDetails'
import type { MoveDetailsDraft } from '@/features/move-request/details'
import type { Option } from '@/lib/options'
import OptionChips from './OptionChips'

type MoveItemsStepProps = {
  draft: MoveDetailsDraft
  onChange: (patch: Partial<MoveDetailsDraft>) => void
}

export default function MoveItemsStep({ draft, onChange }: MoveItemsStepProps) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const listLabelId = useId()
  const category = MOVE_ITEM_CATEGORIES[categoryIndex]

  function countOf(options: Option<MoveItem>[]) {
    return options.reduce(
      (sum, { value }) => sum + (draft.items[value] ?? 0),
      0,
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div>
          <p id={listLabelId} className="text-base leading-6 font-medium">
            짐 목록 <span className="text-sm text-gray-400">(선택)</span>
          </p>
          <p className="text-sm leading-6 text-gray-400">
            신경 쓰이는 큰 짐만 골라도 괜찮아요
          </p>
        </div>

        <div className="flex gap-2">
          {MOVE_ITEM_CATEGORIES.map(({ label, options }, index) => {
            const count = countOf(options)

            return (
              <SelectChip
                key={label}
                selected={index === categoryIndex}
                onClick={() => setCategoryIndex(index)}
              >
                {count > 0 ? `${label} ${count}` : label}
              </SelectChip>
            )
          })}
        </div>

        <ul
          aria-labelledby={listLabelId}
          className="md:grid md:grid-cols-2 md:gap-x-8"
        >
          {category.options.map(({ value: item, label }) => (
            <li
              key={item}
              className="flex items-center justify-between gap-4 border-b border-line-100 py-3"
            >
              <span className="text-base leading-6">{label}</span>
              <QuantityStepper
                label={label}
                value={draft.items[item] ?? 0}
                onChange={(quantity) =>
                  onChange({ items: { ...draft.items, [item]: quantity } })
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <OptionChips
          label="잔짐 박스"
          options={BOX_RANGE_OPTIONS}
          value={draft.boxRange}
          onChange={(boxRange) => onChange({ boxRange })}
        />
        <p className="text-sm leading-6 text-gray-400">
          옷, 식기, 책 같은 작은 짐을 담을 이사박스 5호(60×40×45cm) 기준이에요
        </p>
      </div>
    </div>
  )
}
