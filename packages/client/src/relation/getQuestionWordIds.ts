import type { WordRelation } from './types'

export function getQuestionWordIds(relation: WordRelation): number[] {
  if (relation.type === 'WordExplain') {
    return [relation.wordId]
  }
  if (relation.type === 'WordsUsage') {
    return relation.wordIds
  }
  if (relation.type === 'UnaryProperty' || relation.type === 'BinaryAssociation') {
    return [relation.word1Id]
  }
  if (relation.type === 'TernaryComposition') {
    return [relation.word3Id]
  }
  if (relation.type === 'TernaryIsolation' || relation.type === 'NamedAssociation') {
    return [relation.word1Id, relation.word2Id, relation.word3Id]
  }
  return [relation.word1Id, relation.word2Id]
}
