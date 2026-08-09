import { countReferencingRelations } from './countReferencingRelations'
import type { WordOrSentence } from './types'

export async function confirmRelationImpact(ref: WordOrSentence): Promise<boolean> {
  const count = await countReferencingRelations(ref)
  if (!count) {
    return true
  }
  return window.confirm(`연결된 ${count}건의 관계도 수정됩니다. 계속하시겠습니까?`)
}
