import type { WordRelation, WordOrSentence } from './types'

export function getRelationAnswer(relation: WordRelation): WordOrSentence | null {
  if (!('answer' in relation)) {
    return null
  }
  return relation.answer
}
