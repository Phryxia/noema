import {
  ANSWER_INDEX,
  COMMENT_INDEX,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
} from '../db/consts'

export const NumericWordIndexNames = [
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
]

export const CompoundWordIndexNames = [ANSWER_INDEX, COMMENT_INDEX]
