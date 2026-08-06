import {
  ANSWER_INDEX,
  COMMENT_INDEX,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
} from '../db/consts'
import { MAX_USAGE_WORD_COUNT } from '../explore/consts'
import type { QuestionType } from '../question/types'

export const RELATION_QUERY_KEY = 'relation'
export const TEACH_SOURCE_PREFIX = 'Taught via NOEMA system teaching'
export const TEACH_TYPE_STORAGE_KEY = 'teach/type'

export const NumericWordIndexNames = [
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
]

export const CompoundWordIndexNames = [ANSWER_INDEX, COMMENT_INDEX]

export interface SubjectWordSpec {
  count: number
  minCount: number
}

export const SubjectWordSpecs: Record<QuestionType, SubjectWordSpec> = {
  WordExplain: { count: 1, minCount: 1 },
  WordsUsage: { count: MAX_USAGE_WORD_COUNT, minCount: 1 },
  BinaryCommon: { count: 2, minCount: 2 },
  BinaryDifference: { count: 2, minCount: 2 },
  BinarySimilarity: { count: 2, minCount: 2 },
  TernaryIsolation: { count: 3, minCount: 3 },
}
