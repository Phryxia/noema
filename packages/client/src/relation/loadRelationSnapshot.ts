import { hydrateD2sEntries } from '../d2s/hydrateD2sEntries'
import type { D2sEntry } from '../d2s/types'
import { EmptyAnswer, EmptyComment } from '../explore/consts'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import { getSentence } from '../sentence/sentence.service'
import { getWordValues } from '../word/getWordValues'
import { SubjectWordSpecs } from './consts'
import { getQuestionWordIds } from './getQuestionWordIds'
import { getRelation } from './getRelation'
import { getRelationAnswer } from './getRelationAnswer'
import { getRelationAnswerWordIds } from './getRelationAnswerWordIds'
import { resizeWords } from './resizeWords'
import type { DocumentToSentenceRelation, WordOrSentence, WordRelation } from './types'

export type RelationSnapshot = WordRelationSnapshot | DocumentToSentenceSnapshot

export interface WordRelationSnapshot {
  kind: 'word'
  relation: WordRelation
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export interface DocumentToSentenceSnapshot {
  kind: 'd2s'
  relation: DocumentToSentenceRelation
  entry: D2sEntry
}

export async function loadRelationSnapshot(
  relationId: number,
): Promise<RelationSnapshot | null> {
  const relation = await getRelation(relationId)
  if (!relation) {
    return null
  }
  if (relation.type === 'DocumentToSentence') {
    const [entry] = await hydrateD2sEntries([relation])
    return { kind: 'd2s', relation, entry }
  }
  const values = await getWordValues(getQuestionWordIds(relation))
  return {
    kind: 'word',
    relation,
    words: resizeWords(values, Math.max(values.length, SubjectWordSpecs[relation.type].count)),
    answer: await createAnswerDraft(relation),
    comment: await createTextDraft(relation.comment),
  }
}

async function createAnswerDraft(relation: WordRelation): Promise<AnswerDraft> {
  if (relation.type === 'BinarySimilarity') {
    return { ...EmptyAnswer, similarity: relation.similarity }
  }
  if (relation.type === 'TernaryIsolation') {
    return { ...EmptyAnswer, selection: relation.selection }
  }
  if (relation.type === 'TernaryComposition') {
    return { ...EmptyAnswer, words: await getWordValues(getRelationAnswerWordIds(relation)) }
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
