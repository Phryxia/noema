import { hydrateD2sEntries } from '../d2s/hydrateD2sEntries'
import type { D2sEntry } from '../d2s/types'
import { EmptyAnswer, EmptyComment } from '../explore/consts'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import { hydrateS2wEntries } from '../s2w/hydrateS2wEntries'
import type { S2wEntry } from '../s2w/types'
import { getSentence } from '../sentence/sentence.service'
import { hydrateTagEntries } from '../tag/hydrateTagEntries'
import type { TagEntry } from '../tag/types'
import { getWordValues } from '../word/getWordValues'
import { getQuestionWordIds } from './getQuestionWordIds'
import { getRelation } from './getRelation'
import { getRelationAnswer } from './getRelationAnswer'
import { getRelationAnswerWordIds } from './getRelationAnswerWordIds'
import { QuestionSpecs } from './questionSpecs'
import { resizeWords } from './resizeWords'
import type {
  DocumentToSentenceRelation,
  SentenceToWordRelation,
  TagRelation,
  WordOrSentence,
  WordRelation,
} from './types'

export type RelationSnapshot =
  WordRelationSnapshot | DocumentToSentenceSnapshot | SentenceToWordSnapshot | TagSnapshot

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

export interface SentenceToWordSnapshot {
  kind: 's2w'
  relation: SentenceToWordRelation
  entry: S2wEntry
}

export interface TagSnapshot {
  kind: 'tag'
  relation: TagRelation
  entry: TagEntry
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
  if (relation.type === 'SentenceToWord') {
    const [entry] = await hydrateS2wEntries([relation])
    return { kind: 's2w', relation, entry }
  }
  if (relation.type === 'Tag') {
    const [entry] = await hydrateTagEntries([relation])
    return { kind: 'tag', relation, entry }
  }
  const values = await getWordValues(getQuestionWordIds(relation))
  return {
    kind: 'word',
    relation,
    words: resizeWords(
      values,
      Math.max(values.length, QuestionSpecs[relation.type].subject.count),
    ),
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
