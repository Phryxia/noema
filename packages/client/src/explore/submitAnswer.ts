import { createNewRelation } from './createNewRelation'
import { createAnswerWordIds } from './createAnswerWordIds'
import { createSource, EXPLORE_SOURCE_PREFIX } from './createSource'
import { getAnswerMode } from './getAnswerModes'
import type { AnswerDraft, CommentDraft } from './types'
import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { assertNotDuplicateTernaryRelation } from '../relation/assertNotDuplicateTernaryRelation'
import { getTernaryWordIds } from '../relation/getTernaryWordIds'
import type {
  NewRelation,
  RelationQuestion,
  WordRelation,
  WordOrSentence,
  WordRelationType,
} from '../relation/types'
import { createSentence } from '../sentence/sentence.service'
import { recordCreation } from '../statistic/statistic.service'
import { createWord } from '../word/word.service'
import type { TextWriterMode } from '../writer/types'

export interface SubmitAnswerParams {
  question: RelationQuestion
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

  const relationId = await reserveRelationId(question.type)
  try {
    const source = createSource(relationId, sourcePrefix ?? EXPLORE_SOURCE_PREFIX)
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
    await putRelation({ ...newRelation, relationId, createdAt: new Date() })
  } catch (error) {
    await discardReservedRelation(relationId)
    throw error
  }
  return relationId
}

async function reserveRelationId(type: WordRelationType): Promise<number> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  const relationId = (await awaitRequest<IDBValidKey>(
    transaction.objectStore(RELATIONS_STORE).add({ type }),
  )) as number
  await awaitTransaction(transaction)
  return relationId
}

async function discardReservedRelation(relationId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  transaction.objectStore(RELATIONS_STORE).delete(relationId)
  await awaitTransaction(transaction)
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

async function putRelation(
  relation: NewRelation & Pick<WordRelation, 'relationId' | 'createdAt'>,
): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  transaction.objectStore(RELATIONS_STORE).put(relation)
  await awaitTransaction(transaction)
  recordCreation(db, 'relationCount')
}
