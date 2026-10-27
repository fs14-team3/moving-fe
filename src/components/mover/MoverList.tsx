import type { Mover } from '@/features/movers/types'
import MoverCard from './MoverCard'

type MoverListProps = {
  movers: Mover[]
}

export default function MoverList({ movers }: MoverListProps) {
  if (movers.length === 0) {
    return (
      <p
        role="status"
        className="py-20 text-center text-sm text-gray-400 md:text-base"
      >
        현재 조회할 수 있는 기사님이 없습니다.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-6">
      {movers.map((mover) => (
        <li key={mover.id}>
          <MoverCard mover={mover} />
        </li>
      ))}
    </ul>
  )
}
