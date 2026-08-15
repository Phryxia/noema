import { parseBatchLines } from './parseBatchLines'
import type { BatchResultEntry } from './types'
import { TEACH_SOURCE_PREFIX } from '../consts'
import { createRelationQuestion } from '../createRelationQuestion'
import { findDuplicateTernaryRelationId } from '../findDuplicateTernaryRelationId'
import { EmptyAnswer, EmptyComment } from '../../explore/consts'
import { submitAnswer } from '../../explore/submitAnswer'
import type { ResolvedWord } from '../../qna/types'
import { computeCartesianProduct } from '../../utils/computeCartesianProduct'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { createWord } from '../../word/word.service'

const BATCH_TYPE = 'NamedAssociation'

export async function submitBatchRelations(texts: string[]): Promise<BatchResultEntry[]> {
  const lists = await resolveWords(texts.map(parseBatchLines))
  const tuples = computeCartesianProduct(lists)

  const entries: BatchResultEntry[] = []
  for (const tuple of tuples) {
    entries.push(await submitTuple(tuple))
  }
  if (entries.length && entries.every((entry) => entry.outcome.kind === 'duplicate')) {
    throw new Error('모든 관계가 이미 있습니다')
  }
  return entries
}

async function resolveWords(lists: string[][]): Promise<ResolvedWord[][]> {
  const wordIdMap = new Map<string, number>()
  const resolved: ResolvedWord[][] = []
  for (const list of lists) {
    const words: ResolvedWord[] = []
    for (const value of list) {
      const wordId = wordIdMap.get(value) ?? (await createWord(value))
      wordIdMap.set(value, wordId)
      words.push({ wordId, value })
    }
    resolved.push(words)
  }
  return resolved
}

async function submitTuple(tuple: ResolvedWord[]): Promise<BatchResultEntry> {
  const [word1, word2, word3] = tuple
  const wordIds = tuple.map((word) => word.wordId)
  const duplicateId = await findDuplicateTernaryRelationId(BATCH_TYPE, {
    word1Id: wordIds[0],
    word2Id: wordIds[1],
    word3Id: wordIds[2],
  })
  const { id, outcome } = await resolveOutcome(duplicateId, wordIds)
  return {
    id,
    outcome,
    type: BATCH_TYPE,
    createdAt: new Date(),
    words: [word1, word2],
    answer: { kind: 'selection', word: word3 },
    comment: null,
  }
}

async function resolveOutcome(
  duplicateId: number | null,
  wordIds: number[],
): Promise<Pick<BatchResultEntry, 'id' | 'outcome'>> {
  if (duplicateId !== null) {
    return { id: duplicateId, outcome: { kind: 'duplicate' } }
  }
  try {
    const relationId = await submitAnswer({
      question: createRelationQuestion(BATCH_TYPE, wordIds),
      answer: EmptyAnswer,
      comment: EmptyComment,
      sourcePrefix: TEACH_SOURCE_PREFIX,
    })
    return { id: relationId, outcome: { kind: 'success' } }
  } catch (error) {
    return { id: null, outcome: { kind: 'failure', reason: getErrorMessage(error) } }
  }
}
