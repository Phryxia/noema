export interface Sentence {
  sentenceId: number
  value: string
  createdAt: Date
  modifiedAt?: Date
  source?: string
}

export type RecentSentence = Omit<Sentence, 'modifiedAt' | 'source'>
