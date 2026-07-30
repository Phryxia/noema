import { QuestionTypeSpecs, SimilarityLevels } from '../explore/consts'
import type { QuestionType } from '../question/types'
import type { Similarity } from '../relation/types'

export function getQuestionTypeLabel(type: QuestionType): string {
  return QuestionTypeSpecs.find((spec) => spec.type === type)?.label ?? type
}

export function getSimilarityLabel(similarity: Similarity): string {
  return (
    SimilarityLevels.find((level) => level.value === similarity)?.label ?? String(similarity)
  )
}
