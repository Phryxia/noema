import type { ReactElement } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { RELATION_PAGES_QUERY_KEY } from './consts'
import { RelationSearchResults } from './RelationSearchResults'
import { RelationSource } from './RelationSource'
import { RelationsTable } from './RelationsTable'
import { QnaSearchForm } from '../qna/search/QnaSearchForm'
import { RecentListSection } from '../recent/RecentListPage/RecentListSection'

const routeApi = getRouteApi('/relations')

export function RelationsPage(): ReactElement {
  const { q } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const query = q ?? ''

  function search(nextQuery: string): void {
    navigate({ search: (previous) => ({ ...previous, q: nextQuery }) })
  }

  function cancel(): void {
    navigate({ search: (previous) => ({ ...previous, q: undefined }) })
  }

  return (
    <article>
      <h2>관계</h2>
      <QnaSearchForm query={query} onSearch={search} onCancel={cancel} />
      {!!query && <RelationSearchResults query={query} />}
      <div hidden={!!query}>
        <RecentListSection
          source={RelationSource}
          queryKeyPrefix={RELATION_PAGES_QUERY_KEY}
          Table={RelationsTable}
        />
      </div>
    </article>
  )
}
