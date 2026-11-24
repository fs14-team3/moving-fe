import { useId } from 'react'
import {
  BUILDING_TYPE_OPTIONS,
  ELEVATOR_OPTIONS,
  FLOOR_OPTIONS,
  PARKING_OPTIONS,
} from '@/constants/moveDetails'
import type {
  BuildingDraft,
  MoveDetailsDraft,
} from '@/features/move-request/details'
import OptionChips from './OptionChips'

type BuildingFieldsProps = {
  title: string
  value: BuildingDraft
  onChange: (value: BuildingDraft) => void
}

function BuildingFields({ title, value, onChange }: BuildingFieldsProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5">
      <h3 id={titleId} className="text-lg leading-7 font-bold">
        {title}
      </h3>
      <OptionChips
        label="건물 형태"
        options={BUILDING_TYPE_OPTIONS}
        value={value.buildingType}
        onChange={(buildingType) => onChange({ ...value, buildingType })}
      />
      <OptionChips
        label="층수"
        options={FLOOR_OPTIONS}
        value={value.floor}
        onChange={(floor) => onChange({ ...value, floor })}
      />
      <OptionChips
        label="엘리베이터"
        options={ELEVATOR_OPTIONS}
        value={value.hasElevator}
        onChange={(hasElevator) => onChange({ ...value, hasElevator })}
      />
      <OptionChips
        label="건물 앞 주차"
        options={PARKING_OPTIONS}
        value={value.canPark}
        onChange={(canPark) => onChange({ ...value, canPark })}
      />
    </section>
  )
}

type MoveBuildingStepProps = {
  draft: MoveDetailsDraft
  onChange: (patch: Partial<MoveDetailsDraft>) => void
}

export default function MoveBuildingStep({
  draft,
  onChange,
}: MoveBuildingStepProps) {
  return (
    <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-8">
      <BuildingFields
        title="출발지"
        value={draft.from}
        onChange={(from) => onChange({ from })}
      />
      <BuildingFields
        title="도착지"
        value={draft.to}
        onChange={(to) => onChange({ to })}
      />
    </div>
  )
}
