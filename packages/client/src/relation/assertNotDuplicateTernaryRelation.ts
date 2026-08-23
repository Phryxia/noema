import { findDuplicateTernaryRelationId } from './findDuplicateTernaryRelationId'
import type { TernaryWords, WordRelationType } from './types'

export async function assertNotDuplicateTernaryRelation(
  type: WordRelationType,
  words: TernaryWords | null,
  excludeRelationId?: number,
): Promise<void> {
  if (!words) {
    return
  }
  const duplicateId = await findDuplicateTernaryRelationId(type, words, excludeRelationId)
  if (duplicateId !== null) {
    throw new Error('이미 있는 관계입니다')
  }
}
