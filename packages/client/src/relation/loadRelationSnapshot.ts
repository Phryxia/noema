import { EmptyAnswer, EmptyComment } from '../explore/consts'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import { getSentence } from '../sentence/sentence.service'
import { getWordValues } from '../word/getWordValues'
import { SubjectWordSpecs } from './consts'
import { getQuestionWordIds } from './getQuestionWordIds'
import { getRelation } from './getRelation'
import { getRelationAnswer } from './getRelationAnswer'
import { resizeWords } from './resizeWords'
import type { Relation, WordOrSentence } from './types'

export interface RelationSnapshot {
  relation: Relation
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export async function loadRelationSnapshot(
  relationId: number,
): Promise<RelationSnapshot | null> {
  const relation = await getRelation(relationId)
  if (!relation) {
    return null
  }
  const values = await getWordValues(getQuestionWordIds(relation))
  return {
    relation,
    words: resizeWords(values, Math.max(values.length, SubjectWordSpecs[relation.type].count)),
    answer: await createAnswerDraft(relation),
    comment: await createTextDraft(relation.comment),
  }
}

async function createAnswerDraft(relation: Relation): Promise<AnswerDraft> {
  if (relation.type === 'BinarySimilarity') {
    return { ...EmptyAnswer, similarity: relation.similarity }
  }
  if (relation.type === 'TernaryIsolation') {
    return { ...EmptyAnswer, selection: relation.selection }
  }
  return { ...EmptyAnswer, ...(await createTextDraft(getRelationAnswer(relation))) }
}

async function createTextDraft(ref: WordOrSentence | null | undefined): Promise<CommentDraft> {
  if (!ref) {
    return EmptyComment
  }
  if (ref.type === 'word') {
    const [value] = await getWordValues([ref.id])
    return { mode: '단어', text: value }
  }
  const sentence = await getSentence(ref.id)
  return { mode: '문장', text: sentence?.value ?? '' }
}
