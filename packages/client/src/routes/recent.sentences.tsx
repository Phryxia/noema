import type { ReactElement } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SENTENCES_STORE } from '../db/consts'
import { RECENT_SENTENCE_PAGES_QUERY_KEY } from '../recent/consts'
import { RecentListPage } from '../recent/RecentListPage/RecentListPage'
import type { EntryLinkProps } from '../recent/RecentListPage/RecentTable'
import type { RecentSource } from '../recent/types'

const SentenceSource: RecentSource = { storeName: SENTENCES_STORE }

export const Route = createFileRoute('/recent/sentences')({
  component: RecentSentencesPage,
})

function RecentSentencesPage(): ReactElement {
  return (
    <RecentListPage
      title="최근에 추가된 문장"
      source={SentenceSource}
      queryKeyPrefix={RECENT_SENTENCE_PAGES_QUERY_KEY}
      hasSource
      EntryLink={SentenceEntryLink}
    />
  )
}

function SentenceEntryLink({ entry, children }: EntryLinkProps): ReactElement {
  return (
    <Link to="/sentence/$sentenceId" params={{ sentenceId: String(entry.id) }}>
      {children}
    </Link>
  )
}
