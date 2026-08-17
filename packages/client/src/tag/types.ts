import type { ResolvedDocument, ResolvedSentence } from '../d2s/types'
import type { ResolvedWord } from '../qna/types'

export type TagTarget = { type: 'sentence'; id: number } | { type: 'document'; id: number }

export type ResolvedTagTarget =
  ({ type: 'sentence' } & ResolvedSentence) | ({ type: 'document' } & ResolvedDocument)

export interface TagEntry {
  id: number
  createdAt: Date
  word: ResolvedWord
  target: ResolvedTagTarget
}

export type TagOutcome =
  { kind: 'added' } | { kind: 'removed' } | { kind: 'failure'; reason: string }

export interface TagResult {
  value: string
  outcome: TagOutcome
}
