import { QuestionSpecs } from './questionSpecs'
import { readWordKeys } from './readWordKeys'
import type { WordRelation } from './types'

export function getQuestionWordIds(relation: WordRelation): number[] {
  if (relation.type === 'WordExplain') {
    return [relation.wordId]
  }
  if (relation.type === 'WordsUsage') {
    return relation.wordIds
  }
  const { given } = QuestionSpecs[relation.type]
  if (!Array.isArray(given)) {
    return []
  }
  return readWordKeys(relation, given)
}
