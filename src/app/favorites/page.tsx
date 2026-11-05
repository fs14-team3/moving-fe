'use client'

import Button from '@/components/common/button/Button'
import MoverCard from '@/components/mover/MoverCard'
import { useFavoriteMovers } from '@/features/favorites/hooks/useFavoriteMovers'
import { useRemoveFavorites } from '@/features/favorites/hooks/useRemoveFavorites'
import { Check, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export default function FavoritesPage() {
  // Hooks
  const {
    favoriteMovers,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFavoriteMovers()
  const isInitialError = isError && favoriteMovers.length === 0

  const { mutate: removeFavorites, isPending: isRemovingFavorites } =
    useRemoveFavorites()

  // 무한스크롤
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError)
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '200px 0px',
      },
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  // 기사님 카드 선택
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allSelected =
    favoriteMovers.length > 0 && favoriteMovers.length === selectedIds.length

  function handleSelectAll() {
    setSelectedIds(allSelected ? [] : favoriteMovers.map((mover) => mover.id))
  }

  function handleSelect(moverId: string) {
    setSelectedIds((prev) =>
      prev.includes(moverId)
        ? prev.filter((id) => id !== moverId)
        : [...prev, moverId],
    )
  }

  function handleDeleteSelected() {
    removeFavorites(selectedIds, {
      onSuccess: () => setSelectedIds([]),
    })
  }

  return (
    <div className="flex min-h-page flex-col bg-background-200">
      <header className="shrink-0 bg-gray-50">
        <div className="mx-auto max-w-300 px-[30px] py-[14px] md:px-18 lg:py-8">
          <h1 className="text-lg leading-6 font-semibold lg:text-2xl lg:leading-8">
            찜한 기사님
          </h1>
        </div>
      </header>

      {isPending ? (
        <div
          role="status"
          className="flex flex-1 flex-col items-center justify-center gap-6 lg:gap-8"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-8 animate-spin text-primary-400"
          />
          <p className="leading-6 text-gray-400 lg:text-2xl lg:leading-8">
            찜한 기사님을 불러오고 있습니다.
          </p>
        </div>
      ) : isInitialError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:gap-8">
          <p
            role="alert"
            className="leading-6 text-gray-400 lg:text-2xl lg:leading-8"
          >
            찜한 기사님을 불러오지 못했습니다.
          </p>
          <Button
            variant="outlined"
            disabled={isRefetching}
            onClick={() => refetch()}
            className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto lg:text-sm"
          >
            다시 시도
          </Button>
        </div>
      ) : favoriteMovers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:gap-8">
          <Image
            src="/assets/images/empty-without-text.png"
            width={240}
            height={240}
            alt=""
          />
          <p className="leading-6 text-gray-400 lg:text-2xl lg:leading-8">
            아직 찜한 기사님이 없어요!
          </p>
          <Button href="/movers" className="h-[54px] w-60 lg:h-16 lg:w-[253px]">
            기사님 찜하러 가기
          </Button>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-300 flex-1 px-[30px] pb-14 md:px-18 md:pb-19">
          <section className="flex items-center justify-between pt-[22px] pb-[10px] md:pt-[30px] md:pb-[23px]">
            <label className="flex cursor-pointer items-center gap-2">
              <span className="relative flex size-5 shrink-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="peer size-5 appearance-none rounded-sm border border-line-200 bg-white checked:border-primary-400 checked:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
                />
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-white peer-checked:block"
                />
              </span>
              <span className="text-sm leading-6 font-normal md:text-base">
                전체 선택 ({selectedIds.length}/{favoriteMovers.length})
              </span>
            </label>

            <button
              type="button"
              disabled={selectedIds.length === 0 || isRemovingFavorites}
              onClick={handleDeleteSelected}
              className="text-sm leading-6 font-normal text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
            >
              선택 항목 삭제
            </button>
          </section>

          <ul className="flex flex-col gap-5 md:gap-6">
            {favoriteMovers.map((mover) => (
              <li key={mover.id}>
                <MoverCard
                  mover={mover}
                  selected={selectedIds.includes(mover.id)}
                  onSelect={() => handleSelect(mover.id)}
                />
              </li>
            ))}
          </ul>

          {isFetchingNextPage ? (
            <div role="status" className="flex justify-center py-8">
              <LoaderCircle
                aria-hidden="true"
                className="size-8 animate-spin text-primary-400"
              />
              <span className="sr-only">
                찜한 기사님을 추가로 불러오고 있습니다.
              </span>
            </div>
          ) : isFetchNextPageError ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-8">
              <p className="text-sm text-gray-400">
                기사님을 추가로 불러오지 못했습니다.
              </p>
              <Button
                variant="outlined"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto lg:text-sm"
              >
                다시 시도
              </Button>
            </div>
          ) : null}

          {hasNextPage && !isFetchingNextPage && !isFetchNextPageError && (
            <div ref={sentinelRef} aria-hidden className="h-px" />
          )}
        </main>
      )}
    </div>
  )
}
