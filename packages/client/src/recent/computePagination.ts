const PAGE_WINDOW_RADIUS = 2

export interface PaginationInput {
  currentPage: number
  loadedPageCount: number
  isEndReached: boolean
}

export interface Pagination {
  pages: number[]
  hasLeadingEllipsis: boolean
  hasTrailingEllipsis: boolean
  canGoPrevious: boolean
  canGoNext: boolean
}

export function computePagination({
  currentPage,
  loadedPageCount,
  isEndReached,
}: PaginationInput): Pagination {
  const from = Math.max(1, currentPage - PAGE_WINDOW_RADIUS)
  const to = Math.min(loadedPageCount, currentPage + PAGE_WINDOW_RADIUS)
  const pages: number[] = []
  for (let page = from; page <= to; page += 1) {
    pages.push(page)
  }

  return {
    pages,
    hasLeadingEllipsis: from > 1,
    hasTrailingEllipsis: to < loadedPageCount || !isEndReached,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < loadedPageCount || !isEndReached,
  }
}
