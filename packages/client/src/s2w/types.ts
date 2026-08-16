import type { ResolvedSentence } from '../d2s/types'
import type { ResolvedWord } from '../qna/types'

export interface S2wEntry {
  id: number
  createdAt: Date
  word: ResolvedWord
  sentence: ResolvedSentence
}
