export interface D2sEntry {
  id: number
  createdAt: Date
  document: ResolvedDocument
  sentence: ResolvedSentence
}

export interface ResolvedDocument {
  documentId: number
  preview: string
}

export interface ResolvedSentence {
  sentenceId: number
  value: string
}
