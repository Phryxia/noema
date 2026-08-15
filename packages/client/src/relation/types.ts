import type { BinaryWords, TernaryWords } from '../question/types'

export interface WordOrSentence {
  type: 'word' | 'sentence'
  id: number
}

export type Similarity = -1 | -0.5 | 0 | 0.5 | 1

export interface RelationBase {
  relationId: number
  questionId: number
  createdAt: Date
  modifiedAt?: Date
  comment?: WordOrSentence
}

export interface WordExplainRelation extends RelationBase {
  type: 'WordExplain'
  wordId: number
  answer: WordOrSentence
}

export interface WordsUsageRelation extends RelationBase {
  type: 'WordsUsage'
  wordIds: number[]
  answer: WordOrSentence | null
}

export interface BinaryCommonRelation extends RelationBase, BinaryWords {
  type: 'BinaryCommon'
  answer: WordOrSentence | null
}

export interface BinaryDifferenceRelation extends RelationBase, BinaryWords {
  type: 'BinaryDifference'
  answer: WordOrSentence | null
}

export interface BinarySimilarityRelation extends RelationBase, BinaryWords {
  type: 'BinarySimilarity'
  similarity: Similarity
}

export interface BinaryAssociationRelation extends RelationBase, BinaryWords {
  type: 'BinaryAssociation'
}

export interface TernaryIsolationRelation extends RelationBase, TernaryWords {
  type: 'TernaryIsolation'
  selection: 1 | 2 | 3
}

/**
 * `word3 = word1 + word2` (의미적 또는 문법적 합성)
 */
export interface TernaryCompositionRelation extends RelationBase, TernaryWords {
  type: 'TernaryComposition'
}

/**
 * `word1`과 `word2` 사이에 `word3`의 유향관계가 있음
 */
export interface NamedAssociationRelation extends RelationBase, TernaryWords {
  type: 'NamedAssociation'
}

export type Relation =
  | WordExplainRelation
  | WordsUsageRelation
  | BinaryCommonRelation
  | BinaryDifferenceRelation
  | BinarySimilarityRelation
  | BinaryAssociationRelation
  | TernaryIsolationRelation
  | TernaryCompositionRelation
  | NamedAssociationRelation

export type NewRelation = DistributiveOmit<Relation, keyof Omit<RelationBase, 'comment'>>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
