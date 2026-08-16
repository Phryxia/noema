import type { ReactElement } from 'react'
import { SentenceCell } from '../../d2s/D2sCells'
import { WordLink } from '../../qna/QnaCells'
import type { SentenceToWordSnapshot } from '../../relation/loadRelationSnapshot'
import { PairRelationPage } from '../../relation/PairRelationPage/PairRelationPage'

interface S2wRelationPageProps {
  snapshot: SentenceToWordSnapshot
}

export function S2wRelationPage({ snapshot }: S2wRelationPageProps): ReactElement {
  const { relation, entry } = snapshot

  return (
    <PairRelationPage
      relation={relation}
      rows={[
        { label: '문장', content: <SentenceCell sentence={entry.sentence} /> },
        { label: '단어', content: <WordLink word={entry.word} /> },
      ]}
    />
  )
}
