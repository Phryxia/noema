import type { ResolvedTitle } from '../document/types'

export interface D2sEntry {
  id: number
  createdAt: Date
  document: ResolvedDocument
  sentence: ResolvedSentence
}

export interface ResolvedDocument {
  documentId: number
  title: ResolvedTitle
}

export interface ResolvedSentence {
  sentenceId: number
  value: string
}
