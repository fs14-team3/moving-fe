import RegionDropdown from '@/components/common/dropdown/RegionDropdown'
import ServiceDropdown from '@/components/common/dropdown/ServiceDropdown'
import SortDropdown from '@/components/common/dropdown/SortDropdown'
import SearchInput from '@/components/common/SearchInput'
import FavoriteMoverCard from '@/components/mover/FavoriteMoverCard'
import MoverList from '@/components/mover/MoverList'
import { MOCK_MOVERS } from '@/features/movers/mocks/movers'

export default function MoversPage() {
  const favoriteMovers = MOCK_MOVERS.filter((mover) => mover.isFavorite).slice(
    0,
    3,
  )

  return (
    <div className="mx-auto max-w-300 px-6 pt-[6px] pb-12 lg:pt-0">
      <header className="hidden lg:block lg:py-8">
        <h1 className="text-2xl leading-8 font-semibold">기사님 찾기</h1>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,820px)_327px] lg:gap-x-[54px]">
        <section className="lg:col-start-1 lg:row-start-1">
          <SearchInput />
          <div className="flex justify-between py-4">
            <div className="flex gap-2">
              <RegionDropdown />
              <ServiceDropdown />
            </div>
            <SortDropdown />
          </div>
        </section>

        <aside className="mb-6 min-w-0 lg:col-start-2 lg:row-start-2 lg:mb-0">
          <h2 className="leading-6 font-semibold lg:text-xl lg:leading-8">
            찜한 기사님
          </h2>
          <ul className="mt-2 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {favoriteMovers.map((mover) => (
              <li
                key={mover.id}
                className="w-[327px] max-w-[calc(100vw-48px)] shrink-0 snap-start lg:w-full lg:max-w-none"
              >
                <FavoriteMoverCard mover={mover} />
              </li>
            ))}
          </ul>
        </aside>

        <section className="lg:col-start-1 lg:row-start-2">
          <MoverList movers={MOCK_MOVERS} />
        </section>
      </div>
    </div>
  )
}
