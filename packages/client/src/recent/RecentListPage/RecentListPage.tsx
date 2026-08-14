import type { ComponentType, ReactElement } from 'react'
import { RecentListSection } from './RecentListSection'
import type { RecentSource } from '../types'

interface RecentListPageProps<TEntry, TRow> {
  title: string
  source: RecentSource<TEntry, TRow>
  queryKeyPrefix: string
  Table: ComponentType<{ entries: TEntry[] }>
}

export function RecentListPage<TEntry, TRow>({
  title,
  source,
  queryKeyPrefix,
  Table,
}: RecentListPageProps<TEntry, TRow>): ReactElement {
  return (
    <article>
      <h2>{title}</h2>
      <RecentListSection source={source} queryKeyPrefix={queryKeyPrefix} Table={Table} />
    </article>
  )
}
