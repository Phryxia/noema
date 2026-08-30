import type { ReactElement } from 'react'
import type { DocumentToSentenceSnapshot } from '../../relation/loadRelationSnapshot'
import { PairRelationPage } from '../../relation/PairRelationPage/PairRelationPage'
import { DocumentCell, SentenceCell } from '../D2sCells'

interface D2sRelationPageProps {
  snapshot: DocumentToSentenceSnapshot
}

export function D2sRelationPage({ snapshot }: D2sRelationPageProps): ReactElement {
  const { relation, entry } = snapshot
  const sentenceLabel = relation.type === 'DocumentTitle' ? '제목' : '문장'

  return (
    <PairRelationPage
      relation={relation}
      rows={[
        { label: '문서', content: <DocumentCell document={entry.document} /> },
        { label: sentenceLabel, content: <SentenceCell sentence={entry.sentence} /> },
      ]}
    />
  )
}
