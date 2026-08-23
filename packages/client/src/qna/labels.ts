import { SimilarityLevels } from '../explore/consts'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { Similarity, WordRelationType } from '../relation/types'

export function getQuestionTypeLabel(type: WordRelationType): string {
  return QuestionSpecs[type].label
}

export function getSimilarityLabel(similarity: Similarity): string {
  return (
    SimilarityLevels.find((level) => level.value === similarity)?.label ?? String(similarity)
  )
}
