import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { computePagination } from './computePagination'
import { PAGE_CACHE_MS } from './consts'
import type { Pagination } from './computePagination'
import { createPageQueryKey, ensureRecentPage } from './ensureRecentPage'
import type { RecentFilter, RecentRange, RecentSource } from './types'
import { useExploredRange } from './useExploredRange'
import { useRangePageParams } from './useRangePageParams'

interface UseRecentPagesParams<TEntry, TRow> {
  source: RecentSource<TEntry, TRow>
  queryKeyPrefix: string
  filter?: RecentFilter<TRow>
  extraSearch?: Record<string, string | undefined>
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
  filter,
  extraSearch,
}: UseRecentPagesParams<TEntry, TRow>): RecentPages<TEntry> {
  const queryClient = useQueryClient()
  const { range, rangeKey, currentPage, goToPage, search } = useRangePageParams(extraSearch)
  const { exploredFrom, exploredTo, isEndReached, reportEnd } = useExploredRange(
    `${rangeKey}|${filter?.key ?? ''}`,
    currentPage,
  )

  const { data, isPending, error } = useQuery({
    queryKey: createPageQueryKey(queryKeyPrefix, range, currentPage, filter?.key),
    queryFn: () =>
      ensureRecentPage({ queryClient, source, queryKeyPrefix, range, filter }, currentPage),
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
