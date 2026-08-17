import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker } from '@tanstack/react-router'

interface WriterFormOptions<TDraft, TResult> {
  isEditable: boolean
  isEditing: boolean
  initialDraft: TDraft
  confirmSave?: (draft: TDraft) => Promise<boolean>
  saveDraft: (draft: TDraft) => Promise<TResult>
  saveSuccessMessage: string
  deleteItem?: () => Promise<void>
  deleteSuccessMessage?: string
  invalidateQueries: (queryClient: QueryClient) => void
  onSaved?: (result: TResult) => void
  onDeleted?: () => void
}

interface WriterForm<TDraft> {
  draft: TDraft
  setDraft: Dispatch<SetStateAction<TDraft>>
  resetKey: number
  canSave: boolean
  save: () => void
  remove: () => void
}

export function useWriterForm<TDraft extends { value: string }, TResult = unknown>({
  isEditable,
  isEditing,
  initialDraft,
  confirmSave,
  saveDraft,
  saveSuccessMessage,
  deleteItem,
  deleteSuccessMessage,
  invalidateQueries,
  onSaved,
  onDeleted,
}: WriterFormOptions<TDraft, TResult>): WriterForm<TDraft> {
  const [draft, setDraft] = useState(initialDraft)
  const [resetKey, setResetKey] = useState(0)
  const queryClient = useQueryClient()

  const {
    mutate: save,
    mutateAsync: saveAsync,
    isPending: isSaving,
  } = useMutation({
    mutationFn: () => saveDraft(draft),
    meta: { successMessage: saveSuccessMessage },
    onSuccess: (result) => {
      invalidateQueries(queryClient)
      onSaved?.(result)
      if (isEditing) {
        return
      }
      setDraft(initialDraft)
      setResetKey((current) => current + 1)
    },
  })
  const { mutate: remove, isSuccess: isDeleted } = useMutation({
    mutationFn: async () => {
      await deleteItem?.()
    },
    meta: { successMessage: deleteSuccessMessage },
    onSuccess: () => {
      invalidateQueries(queryClient)
      onDeleted?.()
    },
  })

  const canSave = isEditable && !!draft.value && checkIsDirty(draft, initialDraft) && !isSaving

  useBlocker({
    disabled: !isEditing || !canSave || isDeleted,
    shouldBlockFn: async () => {
      if (!window.confirm('수정된 내용을 저장할까요?')) {
        return false
      }
      if (confirmSave && !(await confirmSave(draft))) {
        return false
      }
      await saveAsync()
      return false
    },
  })

  async function saveIfConfirmed(): Promise<void> {
    if (!canSave) {
      return
    }
    if (confirmSave && !(await confirmSave(draft))) {
      return
    }
    save()
  }

  return {
    draft,
    setDraft,
    resetKey,
    canSave,
    save: (): void => {
      void saveIfConfirmed()
    },
    remove: (): void => {
      if (!deleteItem) {
        return
      }
      remove()
    },
  }
}

function checkIsDirty<TDraft extends object>(draft: TDraft, initialDraft: TDraft): boolean {
  const keys = Object.keys(initialDraft) as (keyof TDraft)[]
  return keys.some((key) => !checkIsSameValue(draft[key], initialDraft[key]))
}

function checkIsSameValue(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return a === b
  }
  return a.length === b.length && a.every((item, index) => item === b[index])
}
