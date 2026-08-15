import type { WordRelation } from './types'

export function getRelationAnswerWordIds(relation: WordRelation): number[] {
  if (relation.type === 'TernaryComposition') {
    return [relation.word1Id, relation.word2Id]
  }
  return []
}
