import type { ReactElement } from 'react'
import { RelationsTable } from './RelationsTable'
import { useRelationSearch } from './useRelationSearch'
import type { Relation } from '../relation/types'
import { PagedSection } from '../shared/PagedSection'

interface RelationSearchResultsProps {
  query: string
  types: Relation['type'][]
}

export function RelationSearchResults({
  query,
  types,
}: RelationSearchResultsProps): ReactElement {
  const { exact, partial } = useRelationSearch(query, types)
  const isSettled = !exact.isPending && !partial.isPending && !exact.error && !partial.error
  const isAllEmpty = isSettled && !exact.entries.length && !partial.entries.length
  const resetKey = `${query}|${types.join(',')}`

  if (isAllEmpty) {
    return <p>일치하는 내용이 없습니다.</p>
  }
  return (
    <>
      <PagedSection
        title="정확히 일치"
        state={exact}
        isLoaderVisible
        resetKey={resetKey}
        renderTable={(pageEntries) => <RelationsTable entries={pageEntries} keyword={query} />}
      />
      <PagedSection
        title="부분 일치"
        state={partial}
        isLoaderVisible={!exact.isPending}
        resetKey={resetKey}
        renderTable={(pageEntries) => <RelationsTable entries={pageEntries} keyword={query} />}
      />
    </>
  )
}
