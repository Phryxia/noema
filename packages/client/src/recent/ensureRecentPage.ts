import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { getRecentPage } from './recent.service'
import type { RecentPage, RecentRange, RecentSource } from './types'

export interface RecentPageQuery {
  queryClient: QueryClient
  source: RecentSource
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

export async function ensureRecentPage(
  query: RecentPageQuery,
  page: number,
): Promise<RecentPage> {
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
