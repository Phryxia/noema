import type { ReactElement } from 'react'
import { QnaSearchSection } from './QnaSearchSection'
import { useQnaSearch } from './useQnaSearch'

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
      <QnaSearchSection
        key={`exact-${query}`}
        title="정확히 일치"
        state={exact}
        keyword={query}
        isLoaderVisible
      />
      <QnaSearchSection
        key={`partial-${query}`}
        title="부분 일치"
        state={partial}
        keyword={query}
        isLoaderVisible={!exact.isPending}
      />
    </>
  )
}
