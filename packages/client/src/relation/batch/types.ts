import type { QnaRowEntry } from '../../qna/types'

export type BatchOutcome =
  { kind: 'success' } | { kind: 'duplicate' } | { kind: 'failure'; reason: string }

export interface BatchResultEntry extends QnaRowEntry {
  outcome: BatchOutcome
}
