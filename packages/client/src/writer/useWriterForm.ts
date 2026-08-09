import { useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlocker } from '@tanstack/react-router'

interface WriterFormOptions<TDraft> {
  isEditable: boolean
  isEditing: boolean
  initialDraft: TDraft
  confirmSave?: () => Promise<boolean>
  saveDraft: (draft: TDraft) => Promise<unknown>
  saveSuccessMessage: string
  deleteItem?: () => Promise<void>
  deleteSuccessMessage?: string
  invalidateQueries: (queryClient: QueryClient) => void
  onDeleted?: () => void
}

interface WriterForm<TDraft> {
  draft: TDraft
  setDraft: (draft: TDraft) => void
  canSave: boolean
  save: () => void
  remove: () => void
}

export function useWriterForm<TDraft extends { value: string }>({
  isEditable,
  isEditing,
  initialDraft,
  confirmSave,
  saveDraft,
  saveSuccessMessage,
  deleteItem,
  deleteSuccessMessage,
  invalidateQueries,
  onDeleted,
}: WriterFormOptions<TDraft>): WriterForm<TDraft> {
  const [draft, setDraft] = useState(initialDraft)
  const queryClient = useQueryClient()

  const {
    mutate: save,
    mutateAsync: saveAsync,
    isPending: isSaving,
  } = useMutation({
    mutationFn: () => saveDraft(draft),
    meta: { successMessage: saveSuccessMessage },
    onSuccess: () => {
      invalidateQueries(queryClient)
      if (isEditing) {
        return
      }
      setDraft(initialDraft)
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
      if (confirmSave && !(await confirmSave())) {
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
    if (confirmSave && !(await confirmSave())) {
      return
    }
    save()
  }

  return {
    draft,
    setDraft,
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
  return keys.some((key) => draft[key] !== initialDraft[key])
}
