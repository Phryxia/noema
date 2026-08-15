import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BatchResultEntry } from './types'
import { invalidateRelationQueries } from '../utils'
import { toast } from '../../toast/toast'

export interface BatchSubmission<TInput> {
  results: BatchResultEntry[] | null
  isSubmitting: boolean
  submit: (input: TInput) => void
}

export function useBatchSubmission<TInput>(
  submitEntries: (input: TInput) => Promise<BatchResultEntry[]>,
  onSaved: () => void,
): BatchSubmission<TInput> {
  const [results, setResults] = useState<BatchResultEntry[] | null>(null)
  const queryClient = useQueryClient()

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitEntries,
    onMutate: () => setResults(null),
    onSuccess: (entries) => {
      setResults(entries)
      invalidateRelationQueries(queryClient)
      const successCount = entries.filter((entry) => entry.outcome.kind === 'success').length
      if (!successCount) {
        return
      }
      toast(`관계 ${successCount}개를 저장했습니다`, 'success')
      onSaved()
    },
  })

  return { results, isSubmitting, submit }
}
