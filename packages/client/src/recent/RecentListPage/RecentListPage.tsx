import type { ComponentType, ReactElement } from 'react'
import { PageNavigator } from './PageNavigator'
import { RangeSearchForm } from './RangeSearchForm'
import { RecentTable } from './RecentTable'
import type { EntryLinkProps } from './RecentTable'
import type { RecentEntry, RecentSource } from '../types'
import { useRecentPages } from '../useRecentPages'

interface RecentListPageProps {
  title: string
  source: RecentSource
  queryKeyPrefix: string
  hasSource: boolean
  EntryLink: ComponentType<EntryLinkProps>
}

export function RecentListPage({
  title,
  source,
  queryKeyPrefix,
  hasSource,
  EntryLink,
}: RecentListPageProps): ReactElement {
  const { range, entries, isPending, error, currentPage, pagination, goToPage, search } =
    useRecentPages({
      source,
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
        hasSource={hasSource}
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
  hasSource: boolean
  EntryLink: ComponentType<EntryLinkProps>
}

function RecentContent({
  isPending,
  error,
  entries,
  hasSource,
  EntryLink,
}: RecentContentProps): ReactElement {
  if (isPending) {
    return <p aria-busy="true" />
  }
  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다. {error.message}</p>
  }
  return <RecentTable entries={entries} hasSource={hasSource} EntryLink={EntryLink} />
}
