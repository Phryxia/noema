import type { WordKey, WordRelationType } from './types'
import type { Option } from '../shared/types'
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
  label: string
  given: QuestionGiven
  answer: QuestionAnswer
  subject: SubjectWordSpec
  isExplorable?: boolean
}

export const QuestionSpecs: Record<WordRelationType, QuestionSpec> = {
  WordExplain: {
    label: '단어 설명',
    given: 'wordId',
    answer: { kind: 'text', modes: SentenceOnlyModes, isRequired: true },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  WordsUsage: {
    label: '예문 만들기',
    given: 'wordIds',
    answer: { kind: 'text', modes: SentenceOnlyModes },
    subject: { count: 2, minCount: 1, isCountAdjustable: true },
    isExplorable: true,
  },
  UnaryProperty: {
    label: '속성',
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['속성'] },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  BinaryCommon: {
    label: '이항 공통점',
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  BinaryDifference: {
    label: '이항 차이점',
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'text', modes: TextWriterModes },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  BinarySimilarity: {
    label: '이항 유사성',
    given: ['word1Id', 'word2Id'],
    answer: { kind: 'similarity' },
    subject: { count: 2, minCount: 2 },
    isExplorable: true,
  },
  BinaryAssociation: {
    label: '연상',
    given: ['word1Id'],
    answer: { kind: 'words', keys: ['word2Id'], placeholders: ['연상 단어'] },
    subject: { count: 1, minCount: 1 },
    isExplorable: true,
  },
  TernaryIsolation: {
    label: '삼항 격리',
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'selection' },
    subject: { count: 3, minCount: 3 },
    isExplorable: true,
  },
  TernaryComposition: {
    label: '삼항 합성',
    given: ['word3Id'],
    answer: { kind: 'words', keys: ['word1Id', 'word2Id'], layout: 'composition' },
    subject: { count: 1, minCount: 1, placeholders: ['단어 3'] },
    isExplorable: true,
  },
  NamedAssociation: {
    label: '관계 짓기',
    given: ['word1Id', 'word2Id', 'word3Id'],
    answer: { kind: 'none' },
    subject: { count: 3, minCount: 3, layout: 'directed' },
  },
}

export const WordRelationTypes = Object.keys(QuestionSpecs) as WordRelationType[]

export const QuestionTypeOptions: Option<WordRelationType>[] = WordRelationTypes.map(
  (value) => ({ value, label: QuestionSpecs[value].label }),
)
