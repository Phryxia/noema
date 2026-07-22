import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DOCUMENTS_STORE } from '../db/consts'
import { RECENT_DOCUMENT_PAGES_QUERY_KEY } from '../recent/consts'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'

export const Route = createFileRoute('/recent/documents')({
  component: RecentDocumentsPage,
})

function RecentDocumentsPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문서"
      storeName={DOCUMENTS_STORE}
      queryKeyPrefix={RECENT_DOCUMENT_PAGES_QUERY_KEY}
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
