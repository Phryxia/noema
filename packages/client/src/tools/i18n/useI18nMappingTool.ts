import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkMappingReady } from './checkMappingReady'
import type { I18nMappingResult } from './submitI18nMapping'
import { submitI18nMapping } from './submitI18nMapping'
import { invalidateRelationQueries } from '../../relation/utils'
import { focusFirstElement } from '../../utils/focusFirstElement'

const INITIAL_MATRIX_ROWS = 3
const INITIAL_MATRIX_COLUMNS = 2

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

export function useI18nMappingTool(): I18nMappingTool {
  const formRef = useRef<HTMLFormElement>(null)
  const [matrix, setMatrix] = useState(createInitialMatrix)
  const [result, setResult] = useState<I18nMappingResult | null>(null)
  const queryClient = useQueryClient()

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitI18nMapping,
    onSuccess: (mappingResult) => {
      invalidateRelationQueries(queryClient)
      setMatrix(createInitialMatrix())
      setResult(mappingResult)
    },
  })

  const isSubmittable = !isSubmitting && checkMappingReady(matrix)

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

function createInitialMatrix(): string[][] {
  return Array.from({ length: INITIAL_MATRIX_ROWS }, () =>
    Array.from({ length: INITIAL_MATRIX_COLUMNS }, () => ''),
  )
}
