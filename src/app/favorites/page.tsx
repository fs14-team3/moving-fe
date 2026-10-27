'use client'

import MoverCard from '@/components/mover/MoverCard'
import { MOCK_MOVERS } from '@/features/movers/mocks/movers'
import { useState } from 'react'

export default function FavoritesPage() {
  const favoriteMovers = MOCK_MOVERS.filter((mover) => mover.isFavorite)

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className="min-h-dvh bg-background-200">
      <header className="bg-gray-50">
        <div className="mx-auto max-w-300 px-[30px] py-[14px] md:px-18 lg:py-8">
          <h1 className="text-lg leading-6 font-semibold lg:text-2xl lg:leading-8">
            찜한 기사님
          </h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-300 px-[30px] md:px-18">
          <section className="flex items-center justify-between pt-[22px] pb-[10px] md:pt-[30px] md:pb-[23px]">
            <label className="flex cursor-pointer gap-2">
              <input type="checkbox" />
              <span className="text-sm leading-6 font-normal md:text-base">
                전체 선택 ({selectedIds.length}/{favoriteMovers.length})
              </span>
            </label>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              className="text-sm leading-6 font-normal text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
            >
              선택 항목 삭제
            </button>
          </section>

          <ul className="flex flex-col gap-5 md:gap-6">
            {favoriteMovers.map((mover) => (
              <li key={mover.id}>
                <MoverCard mover={mover} />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
