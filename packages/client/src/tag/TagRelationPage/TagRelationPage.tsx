import type { ReactElement } from 'react'
import { WordLink } from '../../qna/QnaCells'
import type { TagSnapshot } from '../../relation/loadRelationSnapshot'
import { PairRelationPage } from '../../relation/PairRelationPage/PairRelationPage'
import { getTagTargetLabel, TagTargetCell } from '../TagCells'

interface TagRelationPageProps {
  snapshot: TagSnapshot
}

export function TagRelationPage({ snapshot }: TagRelationPageProps): ReactElement {
  const { relation, entry } = snapshot

  return (
    <PairRelationPage
      relation={relation}
      rows={[
        {
          label: getTagTargetLabel(entry.target),
          content: <TagTargetCell target={entry.target} />,
        },
        { label: '단어', content: <WordLink word={entry.word} /> },
      ]}
    />
  )
}
