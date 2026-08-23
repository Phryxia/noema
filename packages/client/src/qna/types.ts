import type { Similarity, WordRelationType } from '../relation/types'

export interface QnaRowEntry {
  id: number | null
  type: WordRelationType
  createdAt: Date
  words: ResolvedWord[]
  answer: QnaAnswer
  comment: ResolvedText | null
}

export interface QnaEntry extends QnaRowEntry {
  id: number
}

export type QnaAnswer =
  | { kind: 'text'; text: ResolvedText }
  | { kind: 'skip' }
  | { kind: 'similarity'; similarity: Similarity }
  | { kind: 'selection'; word: ResolvedWord }
  | { kind: 'words'; words: ResolvedWord[]; separator: string }

export type ResolvedText =
  { type: 'word'; word: ResolvedWord } | { type: 'sentence'; sentenceId: number; value: string }

export interface ResolvedWord {
  wordId: number
  value: string
}
