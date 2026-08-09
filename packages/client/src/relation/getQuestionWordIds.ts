import type { Relation } from './types'

export function getQuestionWordIds(relation: Relation): number[] {
  if (relation.type === 'WordExplain') {
    return [relation.wordId]
  }
  if (relation.type === 'WordsUsage') {
    return relation.wordIds
  }
  if (relation.type === 'BinaryAssociation') {
    return [relation.word1Id]
  }
  if (relation.type === 'TernaryIsolation') {
    return [relation.word1Id, relation.word2Id, relation.word3Id]
  }
  return [relation.word1Id, relation.word2Id]
}
