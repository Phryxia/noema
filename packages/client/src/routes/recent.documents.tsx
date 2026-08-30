import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DocumentTitleLabel } from '../document/DocumentTitleLabel/DocumentTitleLabel'
import { RecentDocumentSource } from '../document/RecentDocumentSource'
import { RECENT_DOCUMENT_PAGES_QUERY_KEY } from '../recent/consts'
import { parseRangePageParams } from '../recent/parseRangePageParams'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import { RecentTable } from '../recent/RecentListPage/RecentTable'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentEntry } from '../recent/types'

export const Route = createFileRoute('/recent/documents')({
  validateSearch: parseRangePageParams,
  component: RecentDocumentsPage,
})

function RecentDocumentsPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문서"
      source={RecentDocumentSource}
      queryKeyPrefix={RECENT_DOCUMENT_PAGES_QUERY_KEY}
      Table={DocumentTable}
    />
  )
}

function DocumentTable({ entries }: { entries: RecentEntry[] }): ReactElement {
  return <RecentTable entries={entries} hasSource EntryLink={DocumentEntryLink} />
}

function DocumentEntryLink({ entry, children }: EntryLinkProps): ReactElement {
  return (
    <Link to="/document/$documentId" params={{ documentId: String(entry.id) }}>
      {entry.value ? children : <DocumentTitleLabel title={null} />}
    </Link>
  )
}
