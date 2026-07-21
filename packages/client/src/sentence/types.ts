export interface Sentence {
  sentenceId: number
  value: string
  createdAt: Date
  modifiedAt?: Date
}

export type RecentSentence = Omit<Sentence, 'modifiedAt'>
