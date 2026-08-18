import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { RECENT_PAGE_SIZE } from './consts'
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
  { queryClient, source, queryKeyPrefix, range }: RecentPageQuery<TEntry, TRow>,
  page: number,
): Promise<RecentPage<TEntry>> {
  if (page <= 1) {
    return getRecentPage(source, range, { kind: 'offset', offset: 0 })
  }
  const previous = queryClient.getQueryData<RecentPage<TEntry>>(
    createPageQueryKey(queryKeyPrefix, range, page - 1),
  )
  if (!previous) {
    return getRecentPage(source, range, {
      kind: 'offset',
      offset: (page - 1) * RECENT_PAGE_SIZE,
    })
  }
  if (!previous.nextCursor) {
    return { entries: [], nextCursor: null }
  }
  return getRecentPage(source, range, { kind: 'cursor', cursor: previous.nextCursor })
}
