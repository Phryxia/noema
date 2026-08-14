import type { Relation } from '../../relation/types'

export type SearchField = 'word' | 'word1' | 'word2' | 'word3' | 'answer' | 'comment'

export type SearchTextType = 'word' | 'sentence'

export interface SearchTarget {
  field: SearchField
  textType: SearchTextType
  value: string
}

export interface QnaSearchSpace {
  relations: Relation[]
  wordMap: Map<number, string>
  sentenceMap: Map<number, string>
}
