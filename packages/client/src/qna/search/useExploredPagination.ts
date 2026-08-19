import { useState } from 'react'
import { computePagination } from '../../recent/computePagination'
import type { Pagination } from '../../recent/computePagination'

interface ExploredPagination {
  currentPage: number
  pagination: Pagination
  goToPage: (page: number) => void
}

interface ExploredState {
  resetKey: string | undefined
  currentPage: number
  loadedPageCount: number
}

export function useExploredPagination(
  totalPages: number,
  resetKey?: string,
): ExploredPagination {
  const [state, setState] = useState<ExploredState>(() => createExploredState(resetKey))
  const adjusted = state.resetKey === resetKey ? state : createExploredState(resetKey)
  if (adjusted !== state) {
    setState(adjusted)
  }

  function goToPage(page: number): void {
    setState((previous) => ({
      ...previous,
      currentPage: page,
      loadedPageCount: Math.max(previous.loadedPageCount, page),
    }))
  }

  return {
    currentPage: adjusted.currentPage,
    pagination: computePagination({
      currentPage: adjusted.currentPage,
      exploredFrom: 1,
      exploredTo: adjusted.loadedPageCount,
      isEndReached: adjusted.loadedPageCount >= totalPages,
    }),
    goToPage,
  }
}

function createExploredState(resetKey: string | undefined): ExploredState {
  return { resetKey, currentPage: 1, loadedPageCount: 1 }
}
