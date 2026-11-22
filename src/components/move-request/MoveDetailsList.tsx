import { getMoveDetailRows } from '@/features/move-request/format'
import type { MoveRequestDetails } from '@/features/move-request/types'

export default function MoveDetailsList({
  details,
}: {
  details: MoveRequestDetails
}) {
  return (
    <section
      aria-label="요청 상세 정보"
      className="mt-6 rounded-2xl bg-background-200 p-4 md:mt-8 md:px-6 md:py-5"
    >
      <dl className="flex flex-col gap-2">
        {getMoveDetailRows(details).map(({ label, value }) => (
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
