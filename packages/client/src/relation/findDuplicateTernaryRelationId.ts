import { RELATIONS_STORE, WORD1_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { QuestionType, TernaryWords } from '../question/types'
import type { WordRelation } from './types'

export async function findDuplicateTernaryRelationId(
  type: QuestionType,
  words: TernaryWords,
  excludeRelationId?: number,
): Promise<number | null> {
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const candidates = await awaitRequest<WordRelation[]>(
    relationStore.index(WORD1_ID_INDEX).getAll(words.word1Id),
  )
  const duplicated = candidates.find(
    (relation) =>
      relation.type === type &&
      'word3Id' in relation &&
      relation.word2Id === words.word2Id &&
      relation.word3Id === words.word3Id &&
      relation.relationId !== excludeRelationId,
  )
  return duplicated?.relationId ?? null
}
