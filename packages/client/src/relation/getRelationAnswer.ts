import type { Relation, WordOrSentence } from './types'

export function getRelationAnswer(relation: Relation): WordOrSentence | null {
  if (!('answer' in relation)) {
    return null
  }
  return relation.answer
}
