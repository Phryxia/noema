import type { ReactElement } from 'react'
import { RecentWords } from '../word/RecentWords/RecentWords'
import { RecentSentences } from '../sentence/RecentSentences/RecentSentences'
import { RecentDocuments } from '../document/RecentDocuments/RecentDocuments'

export function RecentCreations(): ReactElement {
  return (
    <article>
      <RecentWords />
      <hr />
      <RecentSentences />
      <hr />
      <RecentDocuments />
    </article>
  )
}
