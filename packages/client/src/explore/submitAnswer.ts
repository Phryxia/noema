import { createNewRelation } from './createNewRelation'
import { createAnswerWordIds } from './createAnswerWordIds'
import { createSource, EXPLORE_SOURCE_PREFIX } from './createSource'
import { getAnswerMode } from './getAnswerModes'
import type { AnswerDraft, CommentDraft } from './types'
import { QUESTIONS_STORE, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { NewQuestion } from '../question/types'
import { assertNotDuplicateTernaryRelation } from '../relation/assertNotDuplicateTernaryRelation'
import { getTernaryWordIds } from '../relation/getTernaryWordIds'
import type { NewRelation, Relation, WordOrSentence } from '../relation/types'
import { createSentence } from '../sentence/sentence.service'
import { recordCreation } from '../statistic/statistic.service'
import { createWord } from '../word/word.service'
import type { TextWriterMode } from '../writer/types'

export interface SubmitAnswerParams {
  question: NewQuestion
  answer: AnswerDraft
  comment: CommentDraft
  sourcePrefix?: string
}

export async function submitAnswer({
  question,
  answer,
  comment,
  sourcePrefix,
}: SubmitAnswerParams): Promise<number> {
  const answerWordIds = await createAnswerWordIds(answer)
  await assertNotDuplicateTernaryRelation(
    question.type,
    getTernaryWordIds(question, answerWordIds),
  )

  const createdAt = new Date()
  const questionId = await createQuestion(question, createdAt)
  const source = createSource(questionId, sourcePrefix ?? EXPLORE_SOURCE_PREFIX)
  const answerTarget = await createTarget(
    getAnswerMode(question.type, answer.mode),
    answer.text,
    source,
  )
  const commentTarget = await createTarget(comment.mode, comment.text, source)
  const newRelation = createNewRelation(question, answer, {
    answer: answerTarget,
    answerWordIds,
    comment: commentTarget,
  })
  return createRelation(newRelation, questionId, createdAt)
}

async function createQuestion(question: NewQuestion, createdAt: Date): Promise<number> {
  const db = await openNoemaDB()
  const transaction = db.transaction(QUESTIONS_STORE, 'readwrite')
  const questionId = (await awaitRequest<IDBValidKey>(
    transaction.objectStore(QUESTIONS_STORE).add({ ...question, createdAt }),
  )) as number
  await awaitTransaction(transaction)
  return questionId
}

async function createTarget(
  mode: TextWriterMode,
  text: string,
  source: string,
): Promise<WordOrSentence | null> {
  if (!text) {
    return null
  }
  if (mode === '단어') {
    return { type: 'word', id: await createWord(text) }
  }
  return { type: 'sentence', id: await createSentence(text, source) }
}

async function createRelation(
  newRelation: NewRelation,
  questionId: number,
  createdAt: Date,
): Promise<number> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  const relation: NewRelation & Pick<Relation, 'questionId' | 'createdAt'> = {
    ...newRelation,
    questionId,
    createdAt,
  }
  const relationId = (await awaitRequest<IDBValidKey>(
    transaction.objectStore(RELATIONS_STORE).add(relation),
  )) as number
  await awaitTransaction(transaction)
  recordCreation(db, 'relationCount')
  return relationId
}
