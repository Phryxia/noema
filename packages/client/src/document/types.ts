import type { Sentence } from '../sentence/types'

export interface Document {
  documentId: number
  value: string
  createdAt: Date
  modifiedAt?: Date
  source?: string
}

export interface RecentDocumentSlot {
  documentId: number
  createdAt: Date
}

export interface RecentDocument extends RecentDocumentSlot {
  title: string | null
}

export interface DocumentTitleEntry {
  relationId: number
  sentence: Sentence
}

export type ResolvedTitle = string | null
