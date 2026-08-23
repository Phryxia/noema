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

export interface BinaryWords {
  word1Id: number
  word2Id: number
}

export interface TernaryWords extends BinaryWords {
  word3Id: number
}

export type WordSlot = keyof TernaryWords

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

interface TagRelationBase extends RelationBase {
  type: 'Tag'
  wordId: number
}

export interface SentenceTagRelation extends TagRelationBase {
  sentenceId: number
}

export interface DocumentTagRelation extends TagRelationBase {
  documentId: number
}

export type TagRelation = SentenceTagRelation | DocumentTagRelation

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

export interface TernaryIsolationRelation extends WordRelationBase, TernaryWords {
  type: 'TernaryIsolation'
  selection: 1 | 2 | 3
}

/**
 * UnaryProperty: `word1`이 `word2`의 속성을 가짐
 * BinaryAssociation: `word1`에서 `word2`가 연상됨
 */
export interface BinaryRelation extends WordRelationBase, BinaryWords {
  type: 'UnaryProperty' | 'BinaryAssociation'
}

/**
 * TernaryComposition: `word3 = word1 + word2` (의미적 또는 문법적 합성)
 * NamedAssociation: `word1`과 `word2` 사이에 `word3`의 유향관계가 있음
 */
export interface TernaryRelation extends WordRelationBase, TernaryWords {
  type: 'TernaryComposition' | 'NamedAssociation'
}

export type WordRelation =
  | WordExplainRelation
  | WordsUsageRelation
  | BinaryCommonRelation
  | BinaryDifferenceRelation
  | BinarySimilarityRelation
  | TernaryIsolationRelation
  | BinaryRelation
  | TernaryRelation

export type WordRelationType = WordRelation['type']

export interface RelationQuestion {
  type: WordRelationType
  wordIds: number[]
}

export type Relation =
  WordRelation | DocumentToSentenceRelation | SentenceToWordRelation | TagRelation

export type NewRelation = DistributiveOmit<
  WordRelation,
  keyof Omit<WordRelationBase, 'comment'>
>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
