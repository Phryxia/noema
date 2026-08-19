import type { ReactElement } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { RELATION_PAGES_QUERY_KEY, RelationTypeOptions } from './consts'
import { parseRelationTypes, serializeRelationTypes } from './relationTypeParams'
import { RelationSearchResults } from './RelationSearchResults'
import { RelationSource } from './RelationSource'
import { RelationsTable } from './RelationsTable'
import { useRelationTypeDraft } from './useRelationTypeDraft'
import { QnaSearchForm } from '../qna/search/QnaSearchForm'
import { RecentListSection } from '../recent/RecentListPage/RecentListSection'
import type { RecentFilter } from '../recent/types'
import type { Relation } from '../relation/types'
import { TypeFilterField } from '../shared/TypeFilterField/TypeFilterField'

const routeApi = getRouteApi('/relations')

export function RelationsPage(): ReactElement {
  const { q, types } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const query = q ?? ''
  const appliedTypes = parseRelationTypes(types)
  const appliedKey = appliedTypes.join(',')
  const { draft, setDraft, isChanged } = useRelationTypeDraft(appliedTypes, appliedKey)

  function search(nextQuery: string): void {
    navigate({
      search: (previous) => ({
        ...previous,
        q: nextQuery,
        types: serializeRelationTypes(draft),
        page: isChanged ? undefined : previous.page,
      }),
    })
  }

  function cancel(): void {
    navigate({ search: (previous) => ({ ...previous, q: undefined }) })
  }

  return (
    <article>
      <h2>관계</h2>
      <QnaSearchForm query={query} onSearch={search} onCancel={cancel} />
      <TypeFilterField
        label="포함 유형"
        options={RelationTypeOptions}
        value={draft}
        onChange={setDraft}
      />
      {!!query && <RelationSearchResults query={query} types={appliedTypes} />}
      <div hidden={!!query}>
        <RecentListSection
          source={RelationSource}
          queryKeyPrefix={RELATION_PAGES_QUERY_KEY}
          Table={RelationsTable}
          filter={createTypeFilter(appliedTypes)}
          extraSearch={{ types: serializeRelationTypes(draft) }}
        />
      </div>
    </article>
  )
}

function createTypeFilter(types: Relation['type'][]): RecentFilter<Relation> | undefined {
  if (!types.length) {
    return undefined
  }
  const allowed = new Set(types)
  return { key: types.join(','), accept: (relation) => allowed.has(relation.type) }
}
