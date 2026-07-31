import { createNewRelation } from './createNewRelation'
import { getAnswerMode } from './getAnswerModes'
import type { AnswerDraft, CommentDraft } from './types'
import { QUESTIONS_STORE, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { NewQuestion } from '../question/types'
import type { NewRelation, Relation, WordOrSentence } from '../relation/types'
import { createSentence } from '../sentence/sentence.service'
import { recordCreation } from '../statistic/statistic.service'
import { createWord } from '../word/word.service'
import type { TextWriterMode } from '../writer/types'

export interface SubmitAnswerParams {
  question: NewQuestion
  answer: AnswerDraft
  comment: CommentDraft
}

export async function submitAnswer({
  question,
  answer,
  comment,
}: SubmitAnswerParams): Promise<void> {
  const createdAt = new Date()
  const questionId = await createQuestion(question, createdAt)
  const source = createSource(questionId)
  const answerTarget = await createTarget(
    getAnswerMode(question.type, answer.mode),
    answer.text,
    source,
  )
  const commentTarget = await createTarget(comment.mode, comment.text, source)
  const newRelation = createNewRelation(question, answer, answerTarget, commentTarget)
  await createRelation(newRelation, questionId, createdAt)
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

function createSource(questionId: number): string {
  return `Harvest via NOEMA system exploration, qid=${questionId}`
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
): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  const relation: NewRelation & Pick<Relation, 'questionId' | 'createdAt'> = {
    ...newRelation,
    questionId,
    createdAt,
  }
  transaction.objectStore(RELATIONS_STORE).add(relation)
  await awaitTransaction(transaction)
  recordCreation(db, 'relationCount')
}
