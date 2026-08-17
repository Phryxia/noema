import type { ReactElement } from 'react'
import type { ResolvedTagTarget } from './types'
import { DocumentCell, SentenceCell } from '../d2s/D2sCells'

interface TagTargetCellProps {
  target: ResolvedTagTarget
}

export function TagTargetCell({ target }: TagTargetCellProps): ReactElement {
  if (target.type === 'sentence') {
    return <SentenceCell sentence={target} />
  }
  return <DocumentCell document={target} />
}

export function getTagTargetLabel(target: ResolvedTagTarget): string {
  return target.type === 'sentence' ? '문장' : '문서'
}
