import type { ReactElement } from 'react'
import type { DocumentToSentenceSnapshot } from '../../relation/loadRelationSnapshot'
import { PairRelationPage } from '../../relation/PairRelationPage/PairRelationPage'
import { DocumentCell, SentenceCell } from '../D2sCells'

interface D2sRelationPageProps {
  snapshot: DocumentToSentenceSnapshot
}

export function D2sRelationPage({ snapshot }: D2sRelationPageProps): ReactElement {
  const { relation, entry } = snapshot

  return (
    <PairRelationPage
      relation={relation}
      rows={[
        { label: '문서', content: <DocumentCell document={entry.document} /> },
        { label: '문장', content: <SentenceCell sentence={entry.sentence} /> },
      ]}
    />
  )
}
