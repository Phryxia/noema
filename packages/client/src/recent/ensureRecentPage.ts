import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { getRecentPage } from './recent.service'
import type { RecentPage, RecentRange, RecentSource } from './types'

export interface RecentPageQuery<TEntry, TRow> {
  queryClient: QueryClient
  source: RecentSource<TEntry, TRow>
  queryKeyPrefix: string
  range: RecentRange
}

export function createPageQueryKey(
  queryKeyPrefix: string,
  { since, until }: RecentRange,
  page: number,
): QueryKey {
  return [queryKeyPrefix, since?.getTime() ?? 0, until.getTime(), page]
}

export async function ensureRecentPage<TEntry, TRow>(
  query: RecentPageQuery<TEntry, TRow>,
  page: number,
): Promise<RecentPage<TEntry>> {
  const { queryClient, source, queryKeyPrefix, range } = query
  if (page <= 1) {
    return getRecentPage(source, range, null)
  }

  const previous = await queryClient.ensureQueryData({
    queryKey: createPageQueryKey(queryKeyPrefix, range, page - 1),
    queryFn: () => ensureRecentPage(query, page - 1),
    staleTime: Infinity,
    gcTime: Infinity,
  })
  if (!previous.nextCursor) {
    return { entries: [], nextCursor: null }
  }
  return getRecentPage(source, range, previous.nextCursor)
}
