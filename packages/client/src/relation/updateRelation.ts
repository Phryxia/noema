import { QUESTIONS_STORE, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { createAnswerWordIds } from '../explore/createAnswerWordIds'
import { createNewRelation } from '../explore/createNewRelation'
import { createSource } from '../explore/createSource'
import { getAnswerMode } from '../explore/getAnswerModes'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import type { NewQuestion, Question } from '../question/types'
import { createSentence, getSentence } from '../sentence/sentence.service'
import { createWord } from '../word/word.service'
import type { TextWriterMode } from '../writer/types'
import { assertNotDuplicateTernaryRelation } from './assertNotDuplicateTernaryRelation'
import { TEACH_SOURCE_PREFIX } from './consts'
import { createRelationQuestion } from './createRelationQuestion'
import { getRelationAnswer } from './getRelationAnswer'
import { getTernaryWordIds } from './getTernaryWordIds'
import type { NewRelation, Relation, WordOrSentence } from './types'

type StoredRelation = NewRelation &
  Pick<Relation, 'relationId' | 'questionId' | 'createdAt' | 'modifiedAt'>

export interface UpdateRelationParams {
  relation: Relation
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export async function updateRelation({
  relation,
  words,
  answer,
  comment,
}: UpdateRelationParams): Promise<void> {
  const { relationId, questionId, createdAt, type } = relation
  const wordIds: number[] = []
  for (const word of words.filter(Boolean)) {
    wordIds.push(await createWord(word))
  }
  const question = createRelationQuestion(type, wordIds)
  const answerWordIds = await createAnswerWordIds(answer)
  await assertNotDuplicateTernaryRelation(
    type,
    getTernaryWordIds(question, answerWordIds),
    relationId,
  )
  await putQuestion(question, questionId)

  const source = createSource(questionId, TEACH_SOURCE_PREFIX)
  const answerTarget = await resolveTarget(
    getRelationAnswer(relation),
    getAnswerMode(type, answer.mode),
    answer.text,
    source,
  )
  const commentTarget = await resolveTarget(
    relation.comment,
    comment.mode,
    comment.text,
    source,
  )

  await putRelation({
    ...createNewRelation(question, answer, {
      answer: answerTarget,
      answerWordIds,
      comment: commentTarget,
    }),
    relationId,
    questionId,
    createdAt,
    modifiedAt: new Date(),
  })
}

async function putQuestion(question: NewQuestion, questionId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(QUESTIONS_STORE, 'readwrite')
  const questionStore = transaction.objectStore(QUESTIONS_STORE)

  const stored = await awaitRequest<Question | undefined>(questionStore.get(questionId))
  if (stored) {
    questionStore.put({ ...question, questionId, createdAt: stored.createdAt })
  }
  await awaitTransaction(transaction)
}

async function resolveTarget(
  previous: WordOrSentence | null | undefined,
  mode: TextWriterMode,
  text: string,
  fallbackSource: string,
): Promise<WordOrSentence | null> {
  if (!text) {
    return null
  }
  if (mode === '단어') {
    return { type: 'word', id: await createWord(text) }
  }
  if (previous?.type !== 'sentence') {
    return { type: 'sentence', id: await createSentence(text, fallbackSource) }
  }

  const sentence = await getSentence(previous.id)
  if (sentence?.value === text) {
    return previous
  }
  return {
    type: 'sentence',
    id: await createSentence(text, sentence?.source ?? fallbackSource),
  }
}

async function putRelation(relation: StoredRelation): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  transaction.objectStore(RELATIONS_STORE).put(relation)
  await awaitTransaction(transaction)
}
