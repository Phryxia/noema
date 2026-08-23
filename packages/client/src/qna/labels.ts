import { QuestionTypeOptions, SimilarityLevels } from '../explore/consts'
import type { Similarity, WordRelationType } from '../relation/types'

export function getQuestionTypeLabel(type: WordRelationType): string {
  return QuestionTypeOptions.find((spec) => spec.value === type)?.label ?? type
}

export function getSimilarityLabel(similarity: Similarity): string {
  return (
    SimilarityLevels.find((level) => level.value === similarity)?.label ?? String(similarity)
  )
}
