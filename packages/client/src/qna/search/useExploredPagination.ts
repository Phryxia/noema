import { useState } from 'react'
import { computePagination } from '../../recent/computePagination'
import type { Pagination } from '../../recent/computePagination'

interface ExploredPagination {
  currentPage: number
  pagination: Pagination
  goToPage: (page: number) => void
}

export function useExploredPagination(totalPages: number): ExploredPagination {
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedPageCount, setLoadedPageCount] = useState(1)

  function goToPage(page: number): void {
    setCurrentPage(page)
    setLoadedPageCount((count) => Math.max(count, page))
  }

  return {
    currentPage,
    pagination: computePagination({
      currentPage,
      exploredFrom: 1,
      exploredTo: loadedPageCount,
      isEndReached: loadedPageCount >= totalPages,
    }),
    goToPage,
  }
}
