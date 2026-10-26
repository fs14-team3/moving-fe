import MoverList from '@/components/mover/MoverList'
import { MOCK_MOVERS } from '@/features/movers/mocks/movers'

export default function MoversPage() {
  return (
    <div>
      <header>
        <h1>기사님 찾기</h1>
      </header>
      <MoverList movers={MOCK_MOVERS} />
    </div>
  )
}
