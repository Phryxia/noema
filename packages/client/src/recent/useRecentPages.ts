import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { computePagination } from './computePagination'
import type { Pagination } from './computePagination'
import { createPageQueryKey, ensureRecentPage } from './ensureRecentPage'
import type { RecentEntry, RecentRange, RecentSource } from './types'
import { toInclusiveMinuteEnd } from './utils'

interface UseRecentPagesParams {
  source: RecentSource
  queryKeyPrefix: string
}

interface RecentPages {
  range: RecentRange
  entries: RecentEntry[]
  isPending: boolean
  error: Error | null
  currentPage: number
  pagination: Pagination
  goToPage: (page: number) => void
  search: (range: RecentRange) => void
}

export function useRecentPages({ source, queryKeyPrefix }: UseRecentPagesParams): RecentPages {
  const queryClient = useQueryClient()
  const [range, setRange] = useState<RecentRange>(createInitialRange)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedPageCount, setLoadedPageCount] = useState(1)
  const [isEndReached, setIsEndReached] = useState(false)

  const { data, isPending, error } = useQuery({
    queryKey: createPageQueryKey(queryKeyPrefix, range, currentPage),
    queryFn: () =>
      ensureRecentPage({ queryClient, source, queryKeyPrefix, range }, currentPage),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    if (data && !data.nextCursor) {
      setIsEndReached(true)
    }
  }, [data])

  useEffect(() => {
    return (): void => {
      queryClient.removeQueries({ queryKey: [queryKeyPrefix] })
    }
  }, [queryClient, queryKeyPrefix])

  function goToPage(page: number): void {
    setCurrentPage(page)
    setLoadedPageCount((count) => Math.max(count, page))
  }

  function search(nextRange: RecentRange): void {
    queryClient.removeQueries({ queryKey: [queryKeyPrefix] })
    setRange(nextRange)
    setCurrentPage(1)
    setLoadedPageCount(1)
    setIsEndReached(false)
  }

  return {
    range,
    entries: data?.entries ?? [],
    isPending,
    error,
    currentPage,
    pagination: computePagination({ currentPage, loadedPageCount, isEndReached }),
    goToPage,
    search,
  }
}

function createInitialRange(): RecentRange {
  return { until: toInclusiveMinuteEnd(new Date()) }
}
