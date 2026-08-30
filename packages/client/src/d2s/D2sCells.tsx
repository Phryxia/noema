import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import type { ResolvedDocument, ResolvedSentence } from './types'
import { DocumentTitleLabel } from '../document/DocumentTitleLabel/DocumentTitleLabel'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'

interface DocumentCellProps {
  document: ResolvedDocument
}

export function DocumentCell({ document }: DocumentCellProps): ReactElement {
  if (document.title === '') {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/document/$documentId" params={{ documentId: String(document.documentId) }}>
      <DocumentTitleLabel title={document.title} />
    </Link>
  )
}

interface SentenceCellProps {
  sentence: ResolvedSentence
}

export function SentenceCell({ sentence }: SentenceCellProps): ReactElement {
  if (!sentence.value) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/sentence/$sentenceId" params={{ sentenceId: String(sentence.sentenceId) }}>
      {createPreview(sentence.value, VALUE_PREVIEW_LENGTH)}
    </Link>
  )
}
