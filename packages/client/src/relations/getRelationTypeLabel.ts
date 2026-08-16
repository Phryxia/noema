import { D2S_TYPE_LABEL } from './consts'
import { getQuestionTypeLabel } from '../qna/labels'
import type { Relation } from '../relation/types'

export function getRelationTypeLabel(type: Relation['type']): string {
  if (type === 'DocumentToSentence') {
    return D2S_TYPE_LABEL
  }
  return getQuestionTypeLabel(type)
}
