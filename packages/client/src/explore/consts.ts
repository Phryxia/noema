import { QuestionSpecs, WordRelationTypes } from '../relation/questionSpecs'
import type { Similarity, WordRelationType } from '../relation/types'
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

export const ExploreQuestionTypes: WordRelationType[] = WordRelationTypes.filter(
  (type) => QuestionSpecs[type].isExplorable,
)

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
  words: [],
}

export const EmptyComment: CommentDraft = { mode: '단어', text: '' }
