import type { ReactElement } from 'react'
import { useQnaSearch } from './useQnaSearch'
import { PagedSection } from '../../shared/PagedSection'
import { QnaTable } from '../QnaTable'

interface QnaSearchResultsProps {
  query: string
}

export function QnaSearchResults({ query }: QnaSearchResultsProps): ReactElement {
  const { exact, partial } = useQnaSearch(query)
  const isSettled = !exact.isPending && !partial.isPending && !exact.error && !partial.error
  const isAllEmpty = isSettled && !exact.entries.length && !partial.entries.length

  if (isAllEmpty) {
    return <p>일치하는 내용이 없습니다.</p>
  }
  return (
    <>
      <PagedSection
        key={`exact-${query}`}
        title="정확히 일치"
        state={exact}
        isLoaderVisible
        renderTable={(pageEntries) => <QnaTable entries={pageEntries} keyword={query} />}
      />
      <PagedSection
        key={`partial-${query}`}
        title="부분 일치"
        state={partial}
        isLoaderVisible={!exact.isPending}
        renderTable={(pageEntries) => <QnaTable entries={pageEntries} keyword={query} />}
      />
    </>
  )
}
