import { Minus, Plus } from 'lucide-react'

type QuantityStepperProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

const MAX_QUANTITY = 99

const STEP_BUTTON =
  'flex size-8 cursor-pointer items-center justify-center rounded-full border border-line-200 bg-white text-black-400 disabled:cursor-not-allowed disabled:text-gray-300'

export default function QuantityStepper({
  label,
  value,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        aria-label={`${label} 빼기`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
        className={STEP_BUTTON}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span
        aria-live="polite"
        className="w-6 text-center text-base leading-6 font-semibold"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} 더하기`}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
        className={STEP_BUTTON}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
