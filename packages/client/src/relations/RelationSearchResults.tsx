import type { ReactElement } from 'react'
import { RelationsTable } from './RelationsTable'
import { useRelationSearch } from './useRelationSearch'
import { PagedSection } from '../shared/PagedSection'

interface RelationSearchResultsProps {
  query: string
}

export function RelationSearchResults({ query }: RelationSearchResultsProps): ReactElement {
  const { exact, partial } = useRelationSearch(query)
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
        renderTable={(pageEntries) => <RelationsTable entries={pageEntries} keyword={query} />}
      />
      <PagedSection
        key={`partial-${query}`}
        title="부분 일치"
        state={partial}
        isLoaderVisible={!exact.isPending}
        renderTable={(pageEntries) => <RelationsTable entries={pageEntries} keyword={query} />}
      />
    </>
  )
}
