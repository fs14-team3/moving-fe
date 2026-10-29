'use client'

import RegionDropdown from '@/components/common/dropdown/RegionDropdown'
import ServiceDropdown from '@/components/common/dropdown/ServiceDropdown'
import SortDropdown from '@/components/common/dropdown/SortDropdown'
import SearchInput from '@/components/common/input/SearchInput'
import FavoriteMoverCard from '@/components/mover/FavoriteMoverCard'
import MoverList from '@/components/mover/MoverList'
import { MOVER_SORT_OPTIONS } from '@/constants/moverSort'
import { REGION_OPTIONS } from '@/constants/regions'
import { SERVICE_TYPE_OPTIONS } from '@/constants/services'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useFavoriteMovers } from '@/features/movers/hooks/useFavoriteMovers'
import { useMovers } from '@/features/movers/hooks/useMovers'
import type { MoverListFilters } from '@/features/movers/types'
import { RotateCcw } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type FilterKey = 'keyword' | 'serviceType' | 'region' | 'sort'

export default function MoversPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const keyword = searchParams.get('keyword') ?? ''
  const serviceType = SERVICE_TYPE_OPTIONS.find(
    (option) => option.value === searchParams.get('serviceType'),
  )?.value
  const region = REGION_OPTIONS.find(
    (option) => option.value === searchParams.get('region'),
  )?.value
  const sort = MOVER_SORT_OPTIONS.find(
    (option) => option.value === searchParams.get('sort'),
  )?.value

  const [keywordInput, setKeywordInput] = useState(keyword)

  const filters: MoverListFilters = {
    keyword: keyword || undefined,
    serviceType,
    region,
    sort,
  }

  const { user } = useCurrentUser()
  const isCustomer = user?.role === 'CUSTOMER'

  const { movers } = useMovers(filters)

  const { favoriteMovers } = useFavoriteMovers(
    { limit: 3 },
    { enabled: isCustomer },
  )

  function updateFilter(key: FilterKey, value?: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function resetFilters() {
    setKeywordInput('')
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-300 px-6 pt-[6px] pb-12 lg:pt-0">
      <header className="hidden lg:block lg:py-8">
        <h1 className="text-2xl leading-8 font-semibold">기사님 찾기</h1>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,820px)_327px] lg:gap-x-[54px]">
        <section className="lg:col-start-1 lg:row-start-1">
          <SearchInput
            value={keywordInput}
            onChange={setKeywordInput}
            onSearch={(keyword) =>
              updateFilter('keyword', keyword.trim() || undefined)
            }
          />

          <div className="flex justify-between py-4">
            <div className="flex gap-2">
              <RegionDropdown
                value={region ?? 'all'}
                onChange={(region) =>
                  updateFilter('region', region === 'all' ? undefined : region)
                }
              />
              <ServiceDropdown
                value={serviceType ?? 'all'}
                onChange={(serviceType) =>
                  updateFilter(
                    'serviceType',
                    serviceType === 'all' ? undefined : serviceType,
                  )
                }
              />
              <button
                type="button"
                aria-label="검색 조건 초기화"
                onClick={resetFilters}
                className="cursor-pointer text-gray-300"
              >
                <span
                  aria-hidden="true"
                  className="hidden pl-3 text-base leading-6 font-medium text-gray-400 md:inline"
                >
                  초기화
                </span>
                <RotateCcw className="size-4 md:hidden" />
              </button>
            </div>

            <SortDropdown
              value={sort ?? 'REVIEW_COUNT'}
              onChange={(sort) =>
                updateFilter('sort', sort === 'REVIEW_COUNT' ? undefined : sort)
              }
            />
          </div>
        </section>

        <aside className="mb-6 min-w-0 lg:col-start-2 lg:row-start-2 lg:mb-0">
          <h2 className="leading-6 font-semibold lg:text-xl lg:leading-8">
            찜한 기사님
          </h2>
          {favoriteMovers.length === 0 ? (
            <div
              role="status"
              className="mt-2 flex items-center justify-center rounded-2xl border border-line-100 bg-white px-4 py-6 lg:py-8"
            >
              <p className="text-sm text-gray-400 md:text-base">
                찜한 기사님이 없습니다.
              </p>
            </div>
          ) : (
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
          )}
        </aside>

        <section className="lg:col-start-1 lg:row-start-2">
          <MoverList movers={movers} />
        </section>
      </div>
    </div>
  )
}
