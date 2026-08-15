import { RELATIONS_STORE, WORD1_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { QuestionType, TernaryWords } from '../question/types'
import type { Relation } from './types'

export async function assertNotDuplicateTernaryRelation(
  type: QuestionType,
  words: TernaryWords | null,
  excludeRelationId?: number,
): Promise<void> {
  if (!words) {
    return
  }

  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const candidates = await awaitRequest<Relation[]>(
    relationStore.index(WORD1_ID_INDEX).getAll(words.word1Id),
  )
  const isDuplicated = candidates.some(
    (relation) =>
      relation.type === type &&
      'word3Id' in relation &&
      relation.word2Id === words.word2Id &&
      relation.word3Id === words.word3Id &&
      relation.relationId !== excludeRelationId,
  )
  if (isDuplicated) {
    throw new Error('이미 있는 관계입니다')
  }
}
