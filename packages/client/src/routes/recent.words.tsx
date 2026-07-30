import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { RECENT_WORD_PAGES_QUERY_KEY } from '../recent/consts'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import { RecentTable } from '../recent/RecentListPage/RecentTable'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentEntry } from '../recent/types'
import { RecentWordSource } from '../word/RecentWordSource'

export const Route = createFileRoute('/recent/words')({
  component: RecentWordsPage,
})

function RecentWordsPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 단어"
      source={RecentWordSource}
      queryKeyPrefix={RECENT_WORD_PAGES_QUERY_KEY}
      Table={WordTable}
    />
  )
}

function WordTable({ entries }: { entries: RecentEntry[] }): ReactElement {
  return <RecentTable entries={entries} hasSource={false} EntryLink={WordEntryLink} />
}

function WordEntryLink({ entry, children }: EntryLinkProps): ReactElement {
  return (
    <Link to="/word/$word" params={{ word: entry.value }}>
      {children}
    </Link>
  )
}
