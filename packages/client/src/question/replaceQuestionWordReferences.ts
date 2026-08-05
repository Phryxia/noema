import { QUESTIONS_STORE } from '../db/consts'
import { awaitRequest } from '../db/utils'
import type { Question } from './types'

export async function replaceQuestionWordReferences(
  transaction: IDBTransaction,
  fromId: number,
  toId: number,
): Promise<void> {
  const questionStore = transaction.objectStore(QUESTIONS_STORE)
  const questions = await awaitRequest<Question[]>(questionStore.getAll())

  questions.forEach((question) => {
    if (!replaceIdsInQuestion(question, fromId, toId)) {
      return
    }
    questionStore.put(question)
  })
}

function replaceIdsInQuestion(question: Question, fromId: number, toId: number): boolean {
  let isChanged = false
  if ('wordId' in question && question.wordId === fromId) {
    question.wordId = toId
    isChanged = true
  }
  if ('wordIds' in question && question.wordIds.includes(fromId)) {
    question.wordIds = question.wordIds.map((wordId) => (wordId === fromId ? toId : wordId))
    isChanged = true
  }
  if ('word1Id' in question && question.word1Id === fromId) {
    question.word1Id = toId
    isChanged = true
  }
  if ('word2Id' in question && question.word2Id === fromId) {
    question.word2Id = toId
    isChanged = true
  }
  if ('word3Id' in question && question.word3Id === fromId) {
    question.word3Id = toId
    isChanged = true
  }
  return isChanged
}
