import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DOCUMENTS_STORE } from '../db/consts'
import { RECENT_DOCUMENT_PAGES_QUERY_KEY } from '../recent/consts'
import { parseRangePageParams } from '../recent/parseRangePageParams'
import { toRecentEntry } from '../recent/recent.service'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import { RecentTable } from '../recent/RecentListPage/RecentTable'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentEntry, RecentSource } from '../recent/types'

const DocumentSource: RecentSource = { storeName: DOCUMENTS_STORE, toEntry: toRecentEntry }

export const Route = createFileRoute('/recent/documents')({
  validateSearch: parseRangePageParams,
  component: RecentDocumentsPage,
})

function RecentDocumentsPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문서"
      source={DocumentSource}
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
      {children}
    </Link>
  )
}
