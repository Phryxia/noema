import { RELATIONS_STORE, WORD1_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { QuestionType } from '../question/types'
import { getWordNodeId } from '../word/word.service'
import type { Relation } from './types'

export async function assertNotDuplicateNamedAssociation(
  type: QuestionType,
  words: string[],
  excludeRelationId?: number,
): Promise<void> {
  if (type !== 'NamedAssociation') {
    return
  }

  const [word1Id, word2Id, word3Id] = await Promise.all(words.map(getWordNodeId))
  if (word1Id === null || word2Id === null || word3Id === null) {
    return
  }

  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const candidates = await awaitRequest<Relation[]>(
    relationStore.index(WORD1_ID_INDEX).getAll(word1Id),
  )
  const isDuplicated = candidates.some(
    (relation) =>
      relation.type === 'NamedAssociation' &&
      relation.word2Id === word2Id &&
      relation.word3Id === word3Id &&
      relation.relationId !== excludeRelationId,
  )
  if (isDuplicated) {
    throw new Error('이미 있는 관계입니다')
  }
}
