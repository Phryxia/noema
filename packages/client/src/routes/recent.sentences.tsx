import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SENTENCES_STORE } from '../db/consts'
import { RECENT_SENTENCE_PAGES_QUERY_KEY } from '../recent/consts'
import { parseRangePageParams } from '../recent/parseRangePageParams'
import { toRecentEntry } from '../recent/recent.service'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import { RecentTable } from '../recent/RecentListPage/RecentTable'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentEntry, RecentSource } from '../recent/types'

const SentenceSource: RecentSource = { storeName: SENTENCES_STORE, toEntry: toRecentEntry }

export const Route = createFileRoute('/recent/sentences')({
  validateSearch: parseRangePageParams,
  component: RecentSentencesPage,
})

function RecentSentencesPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문장"
      source={SentenceSource}
      queryKeyPrefix={RECENT_SENTENCE_PAGES_QUERY_KEY}
      Table={SentenceTable}
    />
  )
}

function SentenceTable({ entries }: { entries: RecentEntry[] }): ReactElement {
  return <RecentTable entries={entries} hasSource EntryLink={SentenceEntryLink} />
}

function SentenceEntryLink({ entry, children }: EntryLinkProps): ReactElement {
  return (
    <Link to="/sentence/$sentenceId" params={{ sentenceId: String(entry.id) }}>
      {children}
    </Link>
  )
}
