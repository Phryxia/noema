import type { BatchResultEntry } from './types'
import { TEACH_SOURCE_PREFIX } from '../consts'
import { findDuplicateTernaryRelationId } from '../findDuplicateTernaryRelationId'
import { EmptyAnswer, EmptyComment } from '../../explore/consts'
import { submitAnswer } from '../../explore/submitAnswer'
import type { ResolvedWord } from '../../qna/types'
import { getErrorMessage } from '../../utils/getErrorMessage'

const BATCH_TYPE = 'NamedAssociation'

export async function submitNamedAssociation(tuple: ResolvedWord[]): Promise<BatchResultEntry> {
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
      question: { type: BATCH_TYPE, wordIds },
      answer: EmptyAnswer,
      comment: EmptyComment,
      sourcePrefix: TEACH_SOURCE_PREFIX,
    })
    return { id: relationId, outcome: { kind: 'success' } }
  } catch (error) {
    return { id: null, outcome: { kind: 'failure', reason: getErrorMessage(error) } }
  }
}
