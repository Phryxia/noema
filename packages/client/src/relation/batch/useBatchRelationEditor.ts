import { useState } from 'react'
import { parseBatchLines } from './parseBatchLines'
import { submitBatchRelations } from './submitBatchRelations'
import type { BatchResultEntry } from './types'
import { useBatchSubmission } from './useBatchSubmission'
import type { RelationEditor } from '../useRelationEditor'
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
  const { results, isSubmitting, submit } = useBatchSubmission(submitBatchRelations, () => {
    setTexts(EmptyTexts)
    focusFirstElement(editor.formRef.current)
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
    submit(texts)
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
