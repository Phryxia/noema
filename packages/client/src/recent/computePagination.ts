const PAGE_WINDOW_RADIUS = 2

export interface PaginationInput {
  currentPage: number
  exploredFrom: number
  exploredTo: number
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
  exploredFrom,
  exploredTo,
  isEndReached,
}: PaginationInput): Pagination {
  const from = Math.max(exploredFrom, currentPage - PAGE_WINDOW_RADIUS)
  const to = Math.min(exploredTo, currentPage + PAGE_WINDOW_RADIUS)
  const pages: number[] = []
  for (let page = from; page <= to; page += 1) {
    pages.push(page)
  }

  return {
    pages,
    hasLeadingEllipsis: from > 1,
    hasTrailingEllipsis: to < exploredTo || !isEndReached,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < exploredTo || !isEndReached,
  }
}
