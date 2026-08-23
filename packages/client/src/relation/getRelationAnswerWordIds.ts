import { QuestionSpecs } from './questionSpecs'
import { readWordKeys } from './readWordKeys'
import type { WordRelation } from './types'

export function getRelationAnswerWordIds(relation: WordRelation): number[] {
  const { answer } = QuestionSpecs[relation.type]
  if (answer.kind !== 'words') {
    return []
  }
  return readWordKeys(relation, answer.keys)
}
