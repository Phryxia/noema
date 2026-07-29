import { createNewRelation } from './createNewRelation'
import { getAnswerMode } from './getAnswerModes'
import type { AnswerDraft, CommentDraft } from './types'
import { QUESTIONS_STORE, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { NewQuestion } from '../question/types'
import type { NewRelation, Relation, WordOrSentence } from '../relation/types'
import { createSentence } from '../sentence/sentence.service'
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
  const answerTarget = await createTarget(
    getAnswerMode(question.type, answer.mode),
    answer.text,
  )
  const commentTarget = await createTarget(comment.mode, comment.text)
  const newRelation = createNewRelation(question, answer, answerTarget, commentTarget)

  const db = await openNoemaDB()
  const transaction = db.transaction([QUESTIONS_STORE, RELATIONS_STORE], 'readwrite')
  const createdAt = new Date()
  const questionId = (await awaitRequest<IDBValidKey>(
    transaction.objectStore(QUESTIONS_STORE).add({ ...question, createdAt }),
  )) as number
  const relation: NewRelation & Pick<Relation, 'questionId' | 'createdAt'> = {
    ...newRelation,
    questionId,
    createdAt,
  }
  transaction.objectStore(RELATIONS_STORE).add(relation)
  await awaitTransaction(transaction)
}

async function createTarget(
  mode: TextWriterMode,
  text: string,
): Promise<WordOrSentence | null> {
  if (!text) {
    return null
  }
  if (mode === '단어') {
    return { type: 'word', id: await createWord(text) }
  }
  return { type: 'sentence', id: await createSentence(text, '') }
}
