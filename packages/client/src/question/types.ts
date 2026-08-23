import type { RelationQuestion } from '../relation/types'

export interface Question extends RelationQuestion {
  questionId: number
  createdAt: Date
}
