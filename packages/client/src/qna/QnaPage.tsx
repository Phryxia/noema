import type { ReactElement } from 'react'
import { useState } from 'react'
import { QNA_PAGES_QUERY_KEY, QnaRelationSource } from './QnaRelationSource'
import { QnaTable } from './QnaTable'
import { QnaSearchForm } from './search/QnaSearchForm'
import { QnaSearchResults } from './search/QnaSearchResults'
import { RecentListSection } from '../recent/RecentListPage/RecentListSection'

export function QnaPage(): ReactElement {
  const [query, setQuery] = useState('')

  return (
    <article>
      <h2>관계</h2>
      <QnaSearchForm onSearch={setQuery} onCancel={() => setQuery('')} />
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
