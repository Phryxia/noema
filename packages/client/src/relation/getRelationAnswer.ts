import type { Relation, WordOrSentence } from './types'

export function getRelationAnswer(relation: Relation): WordOrSentence | null {
  if (relation.type === 'UnaryProperty' || relation.type === 'BinaryAssociation') {
    return { type: 'word', id: relation.word2Id }
  }
  if (!('answer' in relation)) {
    return null
  }
  return relation.answer
}
