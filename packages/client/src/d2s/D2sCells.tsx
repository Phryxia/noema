import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import type { ResolvedDocument, ResolvedSentence } from './types'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'

interface DocumentCellProps {
  document: ResolvedDocument
}

export function DocumentCell({ document }: DocumentCellProps): ReactElement {
  if (!document.preview) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/document/$documentId" params={{ documentId: String(document.documentId) }}>
      {document.preview}
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
