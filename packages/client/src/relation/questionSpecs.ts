import type { WordKey, WordRelationType } from './types'
import { SentenceOnlyModes, TextWriterModes } from '../writer/consts'
import type { TextWriterMode } from '../writer/types'

export type QuestionGiven = 'wordId' | 'wordIds' | WordKey[]

export type QuestionAnswer =
  | { kind: 'text'; modes: TextWriterMode[]; isRequired: boolean }
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
}

export const QuestionSpecs: Record<WordRelationType, QuestionSpec> = {
  WordExplain: {
    given: 'wordId',
    answer: { kind: 'text', modes: SentenceOnlyModes, isRequired: true },
    subject: { count: 1, minCount: 1 },
  },
  WordsUsage: {
    given: 'wordIds',
    answer: { kind: 'text', modes: SentenceOnlyModes, isRequired: false },
    subject: { count: 2, minCount: 1, isCountAdjustable: true },
  },
  BinaryCommon: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes, isRequired: false },
    subject: { count: 2, minCount: 2 },
  },
  BinaryDifference: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes, isRequired: false },
    subject: { count: 2, minCount: 2 },
  },
  BinarySimilarity: {
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'similarity' },
    subject: { count: 2, minCount: 2 },
  },
  TernaryIsolation: {
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'selection' },
    subject: { count: 3, minCount: 3 },
  },
  UnaryProperty: {
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['속성'] },
    subject: { count: 1, minCount: 1 },
  },
  BinaryAssociation: {
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['연상 단어'] },
    subject: { count: 1, minCount: 1 },
  },
  TernaryComposition: {
    given: ['word3Id'],
    answer: { kind: 'words', keys: ['word1Id', 'word2Id'], layout: 'composition' },
    subject: { count: 1, minCount: 1, placeholders: ['단어 3'] },
  },
  NamedAssociation: {
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'none' },
    subject: { count: 3, minCount: 3, layout: 'directed' },
  },
}
