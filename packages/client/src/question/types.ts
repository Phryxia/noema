export type QuestionType =
  | 'WordExplain'
  | 'WordsUsage'
  | 'BinaryCommon'
  | 'BinaryDifference'
  | 'BinarySimilarity'
  | 'BinaryAssociation'
  | 'TernaryIsolation'
  | 'TernaryComposition'
  | 'NamedAssociation'

export interface QuestionBase {
  questionId: number
  createdAt: Date
}

export interface BinaryWords {
  word1Id: number
  word2Id: number
}

export interface TernaryWords extends BinaryWords {
  word3Id: number
}

export interface WordExplainQuestion extends QuestionBase {
  type: 'WordExplain'
  wordId: number
}

export interface WordsUsageQuestion extends QuestionBase {
  type: 'WordsUsage'
  wordIds: number[]
}

export interface BinaryCommonQuestion extends QuestionBase, BinaryWords {
  type: 'BinaryCommon'
}

export interface BinaryDifferenceQuestion extends QuestionBase, BinaryWords {
  type: 'BinaryDifference'
}

export interface BinarySimilarityQuestion extends QuestionBase, BinaryWords {
  type: 'BinarySimilarity'
}

export interface BinaryAssociationQuestion extends QuestionBase {
  type: 'BinaryAssociation'
  wordId: number
}

export interface TernaryIsolationQuestion extends QuestionBase, TernaryWords {
  type: 'TernaryIsolation'
}

export interface TernaryCompositionQuestion extends QuestionBase {
  type: 'TernaryComposition'
  word3Id: number
}

export interface NamedAssociationQuestion extends QuestionBase, TernaryWords {
  type: 'NamedAssociation'
}

export type Question =
  | WordExplainQuestion
  | WordsUsageQuestion
  | BinaryCommonQuestion
  | BinaryDifferenceQuestion
  | BinarySimilarityQuestion
  | BinaryAssociationQuestion
  | TernaryIsolationQuestion
  | TernaryCompositionQuestion
  | NamedAssociationQuestion

export type NewQuestion = DistributiveOmit<Question, keyof QuestionBase>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
