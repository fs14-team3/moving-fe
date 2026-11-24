import { useId } from 'react'
import TextArea from '@/components/common/input/TextArea'

const MEMO_MAX_LENGTH = 200

type MoveMemoStepProps = {
  value: string
  onChange: (value: string) => void
}

export default function MoveMemoStep({ value, onChange }: MoveMemoStepProps) {
  const memoId = useId()

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={memoId} className="text-base leading-6 font-medium">
        기사님께 전할 말 <span className="text-sm text-gray-400">(선택)</span>
      </label>
      <TextArea
        id={memoId}
        maxLength={MEMO_MAX_LENGTH}
        placeholder="피아노가 있어요, 주차는 건물 뒤편에 할 수 있어요 등 미리 알려 주세요"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        wrapperClassName="w-full lg:w-full"
      />
      <p className="text-right text-sm text-gray-400">
        {value.length}/{MEMO_MAX_LENGTH}
      </p>
    </div>
  )
}
