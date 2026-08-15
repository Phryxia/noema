import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseBatchLines } from './parseBatchLines'
import { submitBatchRelations } from './submitBatchRelations'
import type { BatchResultEntry } from './types'
import type { RelationEditor } from '../useRelationEditor'
import { invalidateRelationQueries } from '../utils'
import { toast } from '../../toast/toast'
import { focusFirstElement } from '../../utils/focusFirstElement'

const EmptyTexts = ['', '', '']

export interface BatchRelationEditor {
  isEnabled: boolean
  setEnabled: (isEnabled: boolean) => void
  isActive: boolean
  texts: string[]
  setText: (index: number, value: string) => void
  results: BatchResultEntry[] | null
  isSubmitting: boolean
  isSubmittable: boolean
  save: () => void
}

export function useBatchRelationEditor(editor: RelationEditor): BatchRelationEditor {
  const [isEnabled, setEnabled] = useState(false)
  const [texts, setTexts] = useState<string[]>(EmptyTexts)
  const [results, setResults] = useState<BatchResultEntry[] | null>(null)
  const queryClient = useQueryClient()

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: () => submitBatchRelations(texts),
    onMutate: () => setResults(null),
    onSuccess: (entries) => {
      setResults(entries)
      invalidateRelationQueries(queryClient)
      const successCount = entries.filter((entry) => entry.outcome.kind === 'success').length
      if (!successCount) {
        return
      }
      toast(`관계 ${successCount}개를 저장했습니다`, 'success')
      setTexts(EmptyTexts)
      focusFirstElement(editor.formRef.current)
    },
  })

  const isActive = isEnabled && editor.type === 'NamedAssociation'
  const isSubmittable =
    isActive && !isSubmitting && texts.every((text) => parseBatchLines(text).length > 0)

  function setText(index: number, value: string): void {
    setTexts((currentTexts) =>
      currentTexts.map((text, textIndex) => (textIndex === index ? value : text)),
    )
  }

  function save(): void {
    if (!isSubmittable) {
      return
    }
    submit()
  }

  return {
    isEnabled,
    setEnabled,
    isActive,
    texts,
    setText,
    results,
    isSubmitting,
    isSubmittable,
    save,
  }
}
