import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker } from '@tanstack/react-router'
import { createSentence, deleteSentence, updateSentence } from '../sentence.service'
import { invalidateSentenceQueries } from '../utils'
import type { Sentence } from '../types'

interface SentenceWriterFormOptions {
  isEditable: boolean
  sentence?: Sentence
  onDelete?: () => void
}

interface SentenceWriterForm {
  value: string
  setValue: (value: string) => void
  canSave: boolean
  save: () => void
  remove: () => void
}

export function useSentenceWriterForm({
  isEditable,
  sentence,
  onDelete,
}: SentenceWriterFormOptions): SentenceWriterForm {
  const [value, setValue] = useState(sentence?.value ?? '')
  const queryClient = useQueryClient()

  const {
    mutate: saveSentence,
    mutateAsync: saveSentenceAsync,
    isPending: isSaving,
  } = useMutation({
    mutationFn: () => submitSentence(sentence, value),
    onSuccess: () => {
      invalidateSentenceQueries(queryClient)
      if (sentence) {
        return
      }
      setValue('')
    },
  })
  const { mutate: removeSentence, isSuccess: isDeleted } = useMutation({
    mutationFn: deleteSentence,
    onSuccess: () => {
      invalidateSentenceQueries(queryClient)
      onDelete?.()
    },
  })

  const canSave = isEditable && !!value && value !== (sentence?.value ?? '') && !isSaving

  useBlocker({
    disabled: !sentence || !canSave || isDeleted,
    shouldBlockFn: async () => {
      if (window.confirm('수정된 내용을 저장할까요?')) {
        await saveSentenceAsync()
      }
      return false
    },
  })

  return {
    value,
    setValue,
    canSave,
    save: (): void => {
      if (!canSave) {
        return
      }
      saveSentence()
    },
    remove: (): void => {
      if (!sentence) {
        return
      }
      removeSentence(sentence.sentenceId)
    },
  }
}

async function submitSentence(sentence: Sentence | undefined, value: string): Promise<void> {
  if (sentence) {
    await updateSentence(sentence.sentenceId, value)
    return
  }
  await createSentence(value)
}
