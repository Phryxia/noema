import type { WordKey, WordRelationType } from './types'
import { SentenceOnlyModes, TextWriterModes } from '../writer/consts'
import type { TextWriterMode } from '../writer/types'

export type QuestionGiven = 'wordId' | 'wordIds' | WordKey[]

export type QuestionAnswer =
  | { kind: 'text'; modes: TextWriterMode[]; isRequired?: boolean }
  | { kind: 'similarity' }
  | { kind: 'selection' }
  | { kind: 'words'; keys: WordKey[]; layout?: 'composition'; placeholders?: string[] }
  | { kind: 'none' }

export interface SubjectWordSpec {
  count: number
  minCount: number
  isCountAdjustable?: boolean
  layout?: 'directed'
  placeholders?: string[]
}

export interface QuestionSpec {
  given: QuestionGiven
  answer: QuestionAnswer
  subject: SubjectWordSpec
  isExplorable?: boolean
}

export const QuestionSpecs: Record<WordRelationType, QuestionSpec> = {
  WordExplain: {
    given: 'wordId',
    answer: { kind: 'text', modes: SentenceOnlyModes, isRequired: true },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  WordsUsage: {
    given: 'wordIds',
    answer: { kind: 'text', modes: SentenceOnlyModes },
    subject: { count: 2, minCount: 1, isCountAdjustable: true },
    isExplorable: true,
  },
  BinaryCommon: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  BinaryDifference: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  BinarySimilarity: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'similarity' },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  TernaryIsolation: {
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'selection' },
    subject: { count: 3, minCount: 3 },
    isExplorable: true,
  },
  UnaryProperty: {
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['속성'] },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  BinaryAssociation: {
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['연상 단어'] },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  TernaryComposition: {
    given: ['word3Id'],
    answer: { kind: 'words', keys: ['word1Id', 'word2Id'], layout: 'composition' },
    subject: { count: 1, minCount: 1, placeholders: ['단어 3'] },
    isExplorable: true,
  },
  NamedAssociation: {
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'none' },
    subject: { count: 3, minCount: 3, layout: 'directed' },
  },
}
