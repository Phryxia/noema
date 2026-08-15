import type { Relation } from './types'

export function getRelationAnswerWordIds(relation: Relation): number[] {
  if (relation.type === 'TernaryComposition') {
    return [relation.word1Id, relation.word2Id]
  }
  return []
}
