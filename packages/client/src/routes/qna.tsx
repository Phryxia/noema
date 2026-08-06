import type { ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { QNA_PAGES_QUERY_KEY, QnaRelationSource } from '../qna/QnaRelationSource'
import { QnaTable } from '../qna/QnaTable'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'

export const Route = createFileRoute('/qna')({
  component: QnaPage,
})

function QnaPage(): ReactElement {
  return (
    <RecentListPage
      title="관계"
      source={QnaRelationSource}
      queryKeyPrefix={QNA_PAGES_QUERY_KEY}
      Table={QnaTable}
    />
  )
}
