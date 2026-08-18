import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { computePagination } from './computePagination'
import { PAGE_CACHE_MS } from './consts'
import type { Pagination } from './computePagination'
import { createPageQueryKey, ensureRecentPage } from './ensureRecentPage'
import type { RecentRange, RecentSource } from './types'
import { useExploredRange } from './useExploredRange'
import { useRangePageParams } from './useRangePageParams'

interface UseRecentPagesParams<TEntry, TRow> {
  source: RecentSource<TEntry, TRow>
  queryKeyPrefix: string
}

interface RecentPages<TEntry> {
  range: RecentRange
  rangeKey: string
  entries: TEntry[]
  isPending: boolean
  error: Error | null
  currentPage: number
  pagination: Pagination
  goToPage: (page: number) => void
  search: (range: RecentRange) => void
}

export function useRecentPages<TEntry, TRow>({
  source,
  queryKeyPrefix,
}: UseRecentPagesParams<TEntry, TRow>): RecentPages<TEntry> {
  const queryClient = useQueryClient()
  const { range, rangeKey, currentPage, goToPage, search } = useRangePageParams()
  const { exploredFrom, exploredTo, isEndReached, reportEnd } = useExploredRange(
    rangeKey,
    currentPage,
  )

  const { data, isPending, error } = useQuery({
    queryKey: createPageQueryKey(queryKeyPrefix, range, currentPage),
    queryFn: () =>
      ensureRecentPage({ queryClient, source, queryKeyPrefix, range }, currentPage),
    staleTime: PAGE_CACHE_MS,
    gcTime: PAGE_CACHE_MS,
    retry: false,
  })

  useEffect(() => {
    if (data && !data.nextCursor) {
      reportEnd()
    }
  }, [data])

  return {
    range,
    rangeKey,
    entries: data?.entries ?? [],
    isPending,
    error,
    currentPage,
    pagination: computePagination({ currentPage, exploredFrom, exploredTo, isEndReached }),
    goToPage,
    search,
  }
}
