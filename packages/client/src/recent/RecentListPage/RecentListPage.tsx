import type { ComponentType, ReactElement } from 'react'
import { PageNavigator } from './PageNavigator'
import { RangeSearchForm } from './RangeSearchForm'
import type { RecentSource } from '../types'
import { useRecentPages } from '../useRecentPages'

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
  const { range, entries, isPending, error, currentPage, pagination, goToPage, search } =
    useRecentPages({
      source,
      queryKeyPrefix,
    })

  return (
    <article>
      <h2>{title}</h2>
      <RangeSearchForm range={range} onSearch={search} />
      <RecentContent isPending={isPending} error={error} entries={entries} Table={Table} />
      <PageNavigator currentPage={currentPage} pagination={pagination} onChange={goToPage} />
    </article>
  )
}

interface RecentContentProps<TEntry> {
  isPending: boolean
  error: Error | null
  entries: TEntry[]
  Table: ComponentType<{ entries: TEntry[] }>
}

function RecentContent<TEntry>({
  isPending,
  error,
  entries,
  Table,
}: RecentContentProps<TEntry>): ReactElement {
  if (isPending) {
    return <p aria-busy="true" />
  }
  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다. {error.message}</p>
  }
  if (!entries.length) {
    return <p>해당 범위에 아무것도 없습니다</p>
  }
  return <Table entries={entries} />
}
