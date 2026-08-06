import { MAX_USAGE_WORD_COUNT } from '../explore/consts'
import type { QuestionType } from '../question/types'

export const TEACH_SOURCE_PREFIX = 'Taught via NOEMA system teaching'
export const TEACH_TYPE_STORAGE_KEY = 'teach/type'

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
