import type { ComponentType, ReactElement } from 'react'
import { PageNavigator } from './PageNavigator'
import { RangeSearchForm } from './RangeSearchForm'
import { RecentTable } from './RecentTable'
import type { EntryLinkProps } from './RecentTable'
import type { RecentEntry } from '../types'
import { useRecentPages } from '../useRecentPages'

interface RecentListPageProps {
  title: string
  storeName: string
  queryKeyPrefix: string
  EntryLink: ComponentType<EntryLinkProps>
}

export function RecentListPage({
  title,
  storeName,
  queryKeyPrefix,
  EntryLink,
}: RecentListPageProps): ReactElement {
  const { range, entries, isPending, error, currentPage, pagination, goToPage, search } =
    useRecentPages({
      storeName,
      queryKeyPrefix,
    })

  return (
    <article>
      <h2>{title}</h2>
      <RangeSearchForm range={range} onSearch={search} />
      <RecentContent
        isPending={isPending}
        error={error}
        entries={entries}
        EntryLink={EntryLink}
      />
      <PageNavigator currentPage={currentPage} pagination={pagination} onChange={goToPage} />
    </article>
  )
}

interface RecentContentProps {
  isPending: boolean
  error: Error | null
  entries: RecentEntry[]
  EntryLink: ComponentType<EntryLinkProps>
}

function RecentContent({
  isPending,
  error,
  entries,
  EntryLink,
}: RecentContentProps): ReactElement {
  if (isPending) {
    return <p aria-busy="true" />
  }
  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다. {error.message}</p>
  }
  return <RecentTable entries={entries} EntryLink={EntryLink} />
}
