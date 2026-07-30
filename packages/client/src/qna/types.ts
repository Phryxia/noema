import type { QuestionType } from '../question/types'
import type { Similarity } from '../relation/types'

export interface QnaEntry {
  id: number
  type: QuestionType
  createdAt: Date
  words: ResolvedWord[]
  answer: QnaAnswer
  comment: ResolvedText | null
}

export type QnaAnswer =
  | { kind: 'text'; text: ResolvedText }
  | { kind: 'skip' }
  | { kind: 'similarity'; similarity: Similarity }
  | { kind: 'selection'; word: ResolvedWord }

export type ResolvedText =
  { type: 'word'; word: ResolvedWord } | { type: 'sentence'; sentenceId: number; value: string }

export interface ResolvedWord {
  wordId: number
  value: string
}
