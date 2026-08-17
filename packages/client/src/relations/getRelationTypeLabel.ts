import { D2S_TYPE_LABEL, S2W_TYPE_LABEL, TAG_TYPE_LABEL } from './consts'
import { getQuestionTypeLabel } from '../qna/labels'
import type { Relation } from '../relation/types'

export function getRelationTypeLabel(type: Relation['type']): string {
  if (type === 'DocumentToSentence') {
    return D2S_TYPE_LABEL
  }
  if (type === 'SentenceToWord') {
    return S2W_TYPE_LABEL
  }
  if (type === 'Tag') {
    return TAG_TYPE_LABEL
  }
  return getQuestionTypeLabel(type)
}
