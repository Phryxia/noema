import type { ReactElement } from 'react'
import { D2S_PAGES_QUERY_KEY } from './consts'
import { D2sRelationSource } from './D2sRelationSource'
import { D2sTable } from './D2sTable'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'

export function D2sPage(): ReactElement {
  return (
    <RecentListPage
      title="문서-문장 관계"
      source={D2sRelationSource}
      queryKeyPrefix={D2S_PAGES_QUERY_KEY}
      Table={D2sTable}
    />
  )
}
