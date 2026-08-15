import type { WordRelation, WordOrSentence } from './types'

export function getRelationAnswer(relation: WordRelation): WordOrSentence | null {
  if (relation.type === 'UnaryProperty' || relation.type === 'BinaryAssociation') {
    return { type: 'word', id: relation.word2Id }
  }
  if (!('answer' in relation)) {
    return null
  }
  return relation.answer
}
