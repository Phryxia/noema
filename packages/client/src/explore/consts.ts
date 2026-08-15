import type { Option } from '../shared/types'
import type { QuestionType } from '../question/types'
import type { Similarity } from '../relation/types'
import type { AnswerDraft, CommentDraft } from './types'

export const EXPLORE_QUESTION_QUERY_KEY = 'exploreQuestion'
export const CHECKED_TYPES_STORAGE_KEY = 'explore/checkedTypes'
export const USAGE_WORD_COUNT_STORAGE_KEY = 'explore/usageWordCount'
export const WORD_COUNT_QUERY_KEY = 'wordCount'

export const MIN_WORD_COUNT = 10
export const DEFAULT_USAGE_WORD_COUNT = 1

export const ANSWER_INPUT_SELECTOR = [
  'input:not([type="radio"]):not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
].join(',')

export const QuestionTypeOptions: Option<QuestionType>[] = [
  { value: 'WordExplain', label: '단어 설명' },
  { value: 'WordsUsage', label: '예문 만들기' },
  { value: 'UnaryProperty', label: '속성' },
  { value: 'BinaryCommon', label: '이항 공통점' },
  { value: 'BinaryDifference', label: '이항 차이점' },
  { value: 'BinarySimilarity', label: '이항 유사성' },
  { value: 'BinaryAssociation', label: '연상' },
  { value: 'TernaryIsolation', label: '삼항 격리' },
  { value: 'TernaryComposition', label: '삼항 합성' },
  { value: 'NamedAssociation', label: '관계 짓기' },
]

export const ExploreQuestionTypes: QuestionType[] = QuestionTypeOptions.map(
  ({ value }) => value,
).filter((type) => type !== 'NamedAssociation')

export interface SimilarityLevel {
  label: string
  value: Similarity
}

export const SimilarityLevels: SimilarityLevel[] = [
  { label: '매우 반대', value: -1 },
  { label: '약간 반대', value: -0.5 },
  { label: '서로 무관', value: 0 },
  { label: '약간 비슷', value: 0.5 },
  { label: '매우 비슷', value: 1 },
]

export const EmptyAnswer: AnswerDraft = {
  mode: '단어',
  text: '',
  similarity: null,
  selection: null,
  words: ['', ''],
}

export const EmptyComment: CommentDraft = { mode: '단어', text: '' }
