import type { Mover } from '@/features/movers/types'
import MoverCard from './MoverCard'

type MoverListProps = {
  movers: Mover[]
}

export default function MoverList({ movers }: MoverListProps) {
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
