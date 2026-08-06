import { EmptyAnswer, EmptyComment } from '../explore/consts'
import { createEmptyWords } from './createEmptyWords'
import { loadType } from './typeStorage'
import type { RelationValues } from './useRelationEditor'

export function createEmptyRelationValues(): RelationValues {
  const type = loadType()
  return { type, words: createEmptyWords(type), answer: EmptyAnswer, comment: EmptyComment }
}
