import { cn } from '@/lib/cn'

type MoveDetailsListProps = {
  label: string
  rows: { label: string; value: string }[]
  className?: string
}

export default function MoveDetailsList({
  label,
  rows,
  className,
}: MoveDetailsListProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        'rounded-2xl bg-background-200 p-4 md:px-6 md:py-5',
        className,
      )}
    >
      <dl className="flex flex-col gap-2">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex gap-4 text-sm leading-6 md:text-base"
          >
            <dt className="w-20 shrink-0 text-gray-500 md:w-24">{label}</dt>
            <dd className="font-medium wrap-anywhere break-keep">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
