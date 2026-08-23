import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import { createAnswerWordIds } from '../explore/createAnswerWordIds'
import { createNewRelation } from '../explore/createNewRelation'
import { createSource } from '../explore/createSource'
import { getAnswerMode } from '../explore/getAnswerModes'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import { createSentence, getSentence } from '../sentence/sentence.service'
import { createWord } from '../word/word.service'
import type { TextWriterMode } from '../writer/types'
import { assertNotDuplicateTernaryRelation } from './assertNotDuplicateTernaryRelation'
import { TEACH_SOURCE_PREFIX } from './consts'
import { getRelationAnswer } from './getRelationAnswer'
import { getTernaryWordIds } from './getTernaryWordIds'
import type { NewRelation, RelationQuestion, WordRelation, WordOrSentence } from './types'

type StoredRelation = NewRelation &
  Pick<WordRelation, 'relationId' | 'createdAt' | 'modifiedAt'>

export interface UpdateRelationParams {
  relation: WordRelation
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
  const { relationId, createdAt, type } = relation
  const wordIds: number[] = []
  for (const word of words.filter(Boolean)) {
    wordIds.push(await createWord(word))
  }
  const question: RelationQuestion = { type, wordIds }
  const answerWordIds = await createAnswerWordIds(answer)
  await assertNotDuplicateTernaryRelation(
    type,
    getTernaryWordIds(question, answerWordIds),
    relationId,
  )

  const source = createSource(relationId, TEACH_SOURCE_PREFIX)
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
    createdAt,
    modifiedAt: new Date(),
  })
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
