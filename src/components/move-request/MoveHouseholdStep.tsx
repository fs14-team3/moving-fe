import { useId } from 'react'
import {
  AREA_RANGE_OPTIONS,
  RESIDENT_COUNT_OPTIONS,
  SERVICE_LEVEL_OPTIONS,
} from '@/constants/moveDetails'
import type { ServiceType } from '@/constants/services'
import type { MoveDetailsDraft } from '@/features/move-request/details'
import { cn } from '@/lib/cn'
import OptionChips from './OptionChips'

type MoveHouseholdStepProps = {
  moveType: ServiceType | null
  draft: MoveDetailsDraft
  onChange: (patch: Partial<MoveDetailsDraft>) => void
}

export default function MoveHouseholdStep({
  moveType,
  draft,
  onChange,
}: MoveHouseholdStepProps) {
  const serviceLevelLabelId = useId()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p id={serviceLevelLabelId} className="text-base leading-6 font-medium">
          이사 방식
        </p>
        <div
          role="group"
          aria-labelledby={serviceLevelLabelId}
          className="flex flex-col gap-3 md:flex-row"
        >
          {SERVICE_LEVEL_OPTIONS.map(({ value, label, description }) => {
            const isSelected = draft.serviceLevel === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ serviceLevel: value })}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left md:flex-1',
                  isSelected
                    ? 'border-primary-400 bg-primary-100'
                    : 'border-line-200 bg-background-200',
                )}
              >
                <span
                  className={cn(
                    'text-base leading-6 font-semibold',
                    isSelected && 'text-primary-400',
                  )}
                >
                  {label}
                </span>
                <span className="text-sm leading-5 break-keep text-gray-500">
                  {description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <OptionChips
        label="평수"
        options={AREA_RANGE_OPTIONS}
        value={draft.areaRange}
        onChange={(areaRange) => onChange({ areaRange })}
      />

      {moveType !== 'OFFICE' && (
        <OptionChips
          label="거주 인원"
          options={RESIDENT_COUNT_OPTIONS}
          value={draft.residentCount}
          onChange={(residentCount) => onChange({ residentCount })}
        />
      )}
    </div>
  )
}
