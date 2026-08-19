import type { ReactElement, ReactNode } from 'react'
import { PageNavigator } from '../recent/RecentListPage/PageNavigator'
import { RECENT_PAGE_SIZE } from '../recent/consts'
import { useExploredPagination } from '../qna/search/useExploredPagination'

export interface PagedState<TEntry> {
  entries: TEntry[]
  isPending: boolean
  error: Error | null
}

interface PagedSectionProps<TEntry> {
  title: string
  state: PagedState<TEntry>
  isLoaderVisible: boolean
  emptyMessage?: string
  header?: ReactNode
  resetKey?: string
  renderTable: (pageEntries: TEntry[]) => ReactNode
}

export function PagedSection<TEntry>({
  title,
  state,
  isLoaderVisible,
  emptyMessage,
  header,
  resetKey,
  renderTable,
}: PagedSectionProps<TEntry>): ReactElement | null {
  const { entries, isPending, error } = state
  const totalPages = Math.max(1, Math.ceil(entries.length / RECENT_PAGE_SIZE))
  const { currentPage, pagination, goToPage } = useExploredPagination(totalPages, resetKey)

  if (isPending) {
    if (!isLoaderVisible) {
      return null
    }
    return <p aria-busy="true" />
  }
  if (error) {
    return <p role="alert">목록을 불러오지 못했습니다. {error.message}</p>
  }
  if (!entries.length) {
    if (!emptyMessage) {
      return null
    }
    return (
      <section>
        <h3>{title}</h3>
        {header}
        <p>{emptyMessage}</p>
      </section>
    )
  }

  const pageEntries = entries.slice(
    (currentPage - 1) * RECENT_PAGE_SIZE,
    currentPage * RECENT_PAGE_SIZE,
  )
  return (
    <section>
      <h3>{title}</h3>
      {header}
      {renderTable(pageEntries)}
      <PageNavigator currentPage={currentPage} pagination={pagination} onChange={goToPage} />
    </section>
  )
}
