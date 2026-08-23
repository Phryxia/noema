import { QuestionSpecs } from './questionSpecs'
import { readWordSlots } from './readWordSlots'
import type { WordRelation } from './types'

export function getRelationAnswerWordIds(relation: WordRelation): number[] {
  const { answer } = QuestionSpecs[relation.type]
  if (answer.kind !== 'words') {
    return []
  }
  return readWordSlots(relation, answer.slots)
}
