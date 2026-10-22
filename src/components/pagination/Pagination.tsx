import type { Dispatch, SetStateAction } from 'react'

interface PaginationProps {
  page: number
  setPage: Dispatch<SetStateAction<number>>
  totalPage: number
}

export default function Pagination({
  page,
  setPage,
  totalPage,
}: PaginationProps) {
  const pageGroupSize = 5

  if (totalPage <= 0) return null

  const currentGroup = Math.floor((page - 1) / pageGroupSize)
  const startPage = currentGroup * pageGroupSize + 1
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPage)

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  return (
    <nav aria-label="페이지 탐색" className="flex gap-2 lg:gap-[10px]">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        aria-label="이전 페이지"
        className="size-[34px] cursor-pointer rounded-lg bg-gray-50 font-semibold disabled:cursor-not-allowed disabled:text-gray-300 lg:size-12"
      >
        &lt;
      </button>

      <div className="flex gap-1">
        {visiblePages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            aria-current={page === pageNumber ? 'page' : undefined}
            className={`size-[34px] cursor-pointer rounded-lg bg-gray-50 lg:size-12 ${page === pageNumber ? 'font-semibold text-black-400' : 'text-gray-300'} hover:text-black-400`}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={page >= totalPage}
        onClick={() => setPage(page + 1)}
        aria-label="다음 페이지"
        className="size-[34px] cursor-pointer rounded-lg bg-gray-50 font-semibold disabled:cursor-not-allowed disabled:text-gray-300 lg:size-12!"
      >
        &gt;
      </button>
    </nav>
  )
}
