export type CharCount =
  { count: number; min: number } | { count: number; max: number }

type FieldMessageProps = {
  id: string
  error?: string
  charCount?: CharCount
}

function formatCharCount(charCount: CharCount) {
  return 'min' in charCount
    ? `${charCount.count} / 최소 ${charCount.min}자`
    : `${charCount.count} / ${charCount.max}자`
}

export default function FieldMessage({
  id,
  error,
  charCount,
}: FieldMessageProps) {
  if (!error && !charCount) return null

  return (
    <div id={id} className="mt-1 flex gap-2 px-2 text-xs lg:mt-2 lg:text-base">
      {error && <p className="font-medium text-red-500">{error}</p>}
      {charCount && (
        <p className="ml-auto shrink-0 text-black-100">
          {formatCharCount(charCount)}
        </p>
      )}
    </div>
  )
}
