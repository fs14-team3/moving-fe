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
    <nav aria-label="페이지 탐색">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        aria-label="이전 페이지"
      >
        &lt;
      </button>

      {visiblePages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          onClick={() => setPage(pageNumber)}
          aria-current={page === pageNumber ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPage}
        onClick={() => setPage(page + 1)}
        aria-label="다음 페이지"
      >
        &gt;
      </button>
    </nav>
  )
}
