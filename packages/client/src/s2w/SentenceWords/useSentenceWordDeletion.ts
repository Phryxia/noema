import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { S2wEntry } from '../types'
import { deleteRelation } from '../../relation/deleteRelation'
import { hasWordReferences } from '../../relation/hasWordReferences'
import { invalidateRelationQueries } from '../../relation/utils'
import { deleteWord } from '../../word/word.service'
import { invalidateWordAndQnaQueries } from '../../word/utils'

export function useSentenceWordDeletion(): (entry: S2wEntry) => void {
  const queryClient = useQueryClient()
  const { mutate: removeWord } = useMutation({
    mutationFn: (wordId: number) => deleteWord(wordId),
    meta: { successMessage: '단어를 삭제했습니다' },
    onSuccess: () => invalidateWordAndQnaQueries(queryClient),
  })
  const { mutate: removeRelation } = useMutation({
    mutationFn: (entry: S2wEntry) => deleteRelation(entry.id),
    meta: { successMessage: '관계를 삭제했습니다' },
    onSuccess: async (_, entry): Promise<void> => {
      invalidateRelationQueries(queryClient)
      if (await hasWordReferences(entry.word.wordId)) {
        return
      }
      if (!window.confirm('단어도 삭제할까요? (확인 시 삭제)')) {
        return
      }
      removeWord(entry.word.wordId)
    },
  })
  return removeRelation
}
