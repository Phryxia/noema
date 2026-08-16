import type { BinaryWords, TernaryWords } from '../question/types'

export interface WordOrSentence {
  type: 'word' | 'sentence'
  id: number
}

export type Similarity = -1 | -0.5 | 0 | 0.5 | 1

export interface RelationBase {
  relationId: number
  createdAt: Date
  modifiedAt?: Date
}

export interface WordRelationBase extends RelationBase {
  questionId: number
  comment?: WordOrSentence
}

export interface DocumentToSentenceRelation extends RelationBase {
  type: 'DocumentToSentence'
  documentId: number
  sentenceId: number
}

export interface SentenceToWordRelation extends RelationBase {
  type: 'SentenceToWord'
  sentenceId: number
  wordId: number
}

export interface WordExplainRelation extends WordRelationBase {
  type: 'WordExplain'
  wordId: number
  answer: WordOrSentence
}

export interface WordsUsageRelation extends WordRelationBase {
  type: 'WordsUsage'
  wordIds: number[]
  answer: WordOrSentence | null
}

/**
 * `word1`이 `word2`의 속성을 가짐
 */
export interface UnaryPropertyRelation extends WordRelationBase, BinaryWords {
  type: 'UnaryProperty'
}

export interface BinaryCommonRelation extends WordRelationBase, BinaryWords {
  type: 'BinaryCommon'
  answer: WordOrSentence | null
}

export interface BinaryDifferenceRelation extends WordRelationBase, BinaryWords {
  type: 'BinaryDifference'
  answer: WordOrSentence | null
}

export interface BinarySimilarityRelation extends WordRelationBase, BinaryWords {
  type: 'BinarySimilarity'
  similarity: Similarity
}

export interface BinaryAssociationRelation extends WordRelationBase, BinaryWords {
  type: 'BinaryAssociation'
}

export interface TernaryIsolationRelation extends WordRelationBase, TernaryWords {
  type: 'TernaryIsolation'
  selection: 1 | 2 | 3
}

/**
 * `word3 = word1 + word2` (의미적 또는 문법적 합성)
 */
export interface TernaryCompositionRelation extends WordRelationBase, TernaryWords {
  type: 'TernaryComposition'
}

/**
 * `word1`과 `word2` 사이에 `word3`의 유향관계가 있음
 */
export interface NamedAssociationRelation extends WordRelationBase, TernaryWords {
  type: 'NamedAssociation'
}

export type WordRelation =
  | WordExplainRelation
  | WordsUsageRelation
  | UnaryPropertyRelation
  | BinaryCommonRelation
  | BinaryDifferenceRelation
  | BinarySimilarityRelation
  | BinaryAssociationRelation
  | TernaryIsolationRelation
  | TernaryCompositionRelation
  | NamedAssociationRelation

export type Relation = WordRelation | DocumentToSentenceRelation | SentenceToWordRelation

export type NewRelation = DistributiveOmit<
  WordRelation,
  keyof Omit<WordRelationBase, 'comment'>
>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
