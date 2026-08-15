import type { Relation, WordRelation } from './types'

export function checkIsWordRelation(relation: Relation): relation is WordRelation {
  return relation.type !== 'DocumentToSentence'
}
