import { useState } from 'react'
import { hasWordReferences } from '../relation/hasWordReferences'
import type { Lexis } from './types'

interface GuardedWordDeletion {
  pendingWord: Lexis | null
  requestDelete: (lexis: Lexis) => Promise<void>
  cancelReplace: () => void
  confirmReplace: (replacementValue: string) => void
}

export function useGuardedWordDeletion(
  deleteNow: (lexis: Lexis, replacementValue: string | null) => void,
): GuardedWordDeletion {
  const [pendingWord, setPendingWord] = useState<Lexis | null>(null)

  return {
    pendingWord,
    requestDelete: async (lexis): Promise<void> => {
      if (await hasWordReferences(lexis.nodeId)) {
        setPendingWord(lexis)
        return
      }
      deleteNow(lexis, null)
    },
    cancelReplace: () => setPendingWord(null),
    confirmReplace: (replacementValue): void => {
      if (!pendingWord) {
        return
      }
      setPendingWord(null)
      deleteNow(pendingWord, replacementValue)
    },
  }
}
