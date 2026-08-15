import type { ReactElement } from 'react'
import { useExploredPagination } from './useExploredPagination'
import type { QnaSearchSectionState } from './useQnaSearch'
import { PageNavigator } from '../../recent/RecentListPage/PageNavigator'
import { RECENT_PAGE_SIZE } from '../../recent/consts'
import { QnaTable } from '../QnaTable'

interface QnaSearchSectionProps {
  title: string
  state: QnaSearchSectionState
  keyword: string
  isLoaderVisible: boolean
  emptyMessage?: string
}

export function QnaSearchSection({
  title,
  state,
  keyword,
  isLoaderVisible,
  emptyMessage,
}: QnaSearchSectionProps): ReactElement | null {
  const { entries, isPending, error } = state
  const totalPages = Math.max(1, Math.ceil(entries.length / RECENT_PAGE_SIZE))
  const { currentPage, pagination, goToPage } = useExploredPagination(totalPages)

  if (isPending) {
    if (!isLoaderVisible) {
      return null
    }
    return <p aria-busy="true" />
  }
  if (error) {
    return <p role="alert">검색 결과를 불러오지 못했습니다. {error.message}</p>
  }
  if (!entries.length) {
    if (!emptyMessage) {
      return null
    }
    return (
      <section>
        <h3>{title}</h3>
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
      <QnaTable entries={pageEntries} keyword={keyword} />
      <PageNavigator currentPage={currentPage} pagination={pagination} onChange={goToPage} />
    </section>
  )
}
