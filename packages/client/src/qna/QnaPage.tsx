import type { ReactElement } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { QNA_PAGES_QUERY_KEY, QnaRelationSource } from './QnaRelationSource'
import { QnaTable } from './QnaTable'
import { QnaSearchForm } from './search/QnaSearchForm'
import { QnaSearchResults } from './search/QnaSearchResults'
import { RecentListSection } from '../recent/RecentListPage/RecentListSection'

const routeApi = getRouteApi('/relations/w2w')

export function QnaPage(): ReactElement {
  const { q } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const query = q ?? ''

  function search(nextQuery: string): void {
    navigate({ search: { q: nextQuery } })
  }

  function cancel(): void {
    navigate({ search: {} })
  }

  return (
    <article>
      <h2>관계</h2>
      <QnaSearchForm query={query} onSearch={search} onCancel={cancel} />
      {!!query && <QnaSearchResults query={query} />}
      <div hidden={!!query}>
        <RecentListSection
          source={QnaRelationSource}
          queryKeyPrefix={QNA_PAGES_QUERY_KEY}
          Table={QnaTable}
        />
      </div>
    </article>
  )
}
