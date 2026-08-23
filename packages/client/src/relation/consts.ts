import {
  ANSWER_INDEX,
  COMMENT_INDEX,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
} from '../db/consts'

export const RELATION_QUERY_KEY = 'relation'

export const NonWordRelationTypes = new Set(['DocumentToSentence', 'SentenceToWord', 'Tag'])
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
