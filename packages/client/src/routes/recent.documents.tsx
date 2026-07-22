import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DOCUMENTS_STORE } from '../db/consts'
import { RECENT_DOCUMENT_PAGES_QUERY_KEY } from '../recent/consts'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentSource } from '../recent/types'

const DocumentSource: RecentSource = { storeName: DOCUMENTS_STORE }

export const Route = createFileRoute('/recent/documents')({
  component: RecentDocumentsPage,
})

function RecentDocumentsPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문서"
      source={DocumentSource}
      queryKeyPrefix={RECENT_DOCUMENT_PAGES_QUERY_KEY}
      hasSource
      EntryLink={DocumentEntryLink}
    />
  )
}

function DocumentEntryLink({ entry, children }: EntryLinkProps): ReactElement {
  return (
    <Link to="/document/$documentId" params={{ documentId: String(entry.id) }}>
      {children}
    </Link>
  )
}
