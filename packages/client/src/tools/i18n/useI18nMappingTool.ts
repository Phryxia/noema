import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkMappingReady } from './checkMappingReady'
import type { ColumnPair } from './computeMappingTuples'
import type { I18nMappingResult } from './submitI18nMapping'
import { submitI18nMapping } from './submitI18nMapping'
import { invalidateRelationQueries } from '../../relation/utils'
import { focusFirstElement } from '../../utils/focusFirstElement'

export interface MappingToolOptions {
  createInitialMatrix: () => string[][]
  columnPairs: ColumnPair[] | null
}

interface I18nMappingTool {
  formRef: RefObject<HTMLFormElement | null>
  matrix: string[][]
  setMatrix: Dispatch<SetStateAction<string[][]>>
  result: I18nMappingResult | null
  isSubmitting: boolean
  isSubmittable: boolean
  save: () => void
  closeResult: () => void
}

export function useI18nMappingTool(options: MappingToolOptions): I18nMappingTool {
  const formRef = useRef<HTMLFormElement>(null)
  const [matrix, setMatrix] = useState(options.createInitialMatrix)
  const [result, setResult] = useState<I18nMappingResult | null>(null)
  const queryClient = useQueryClient()

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (submittedMatrix: string[][]) =>
      submitI18nMapping(submittedMatrix, options.columnPairs),
    onSuccess: (mappingResult) => {
      invalidateRelationQueries(queryClient)
      setMatrix(options.createInitialMatrix())
      setResult(mappingResult)
    },
  })

  const isSubmittable = !isSubmitting && checkMappingReady(matrix, options.columnPairs)

  function save(): void {
    if (!isSubmittable) {
      return
    }
    mutate(matrix)
  }

  function closeResult(): void {
    focusFirstElement(formRef.current)
    setResult(null)
  }

  return {
    formRef,
    matrix,
    setMatrix,
    result,
    isSubmitting,
    isSubmittable,
    save,
    closeResult,
  }
}
