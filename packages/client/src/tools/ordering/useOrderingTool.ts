import { useRef, useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { MIN_ORDERING_WORD_COUNT } from './consts'
import { submitOrdering } from './submitOrdering'
import type { BatchResultEntry } from '../../relation/batch/types'
import { useBatchSubmission } from '../../relation/batch/useBatchSubmission'
import { focusFirstElement } from '../../utils/focusFirstElement'

const EmptyWords = Array.from({ length: MIN_ORDERING_WORD_COUNT }, () => '')

export interface OrderingTool {
  formRef: RefObject<HTMLFormElement | null>
  words: string[]
  setWords: Dispatch<SetStateAction<string[]>>
  results: BatchResultEntry[] | null
  isSubmitting: boolean
  isSubmittable: boolean
  save: () => void
}

export function useOrderingTool(): OrderingTool {
  const formRef = useRef<HTMLFormElement>(null)
  const [words, setWords] = useState<string[]>(EmptyWords)
  const { results, isSubmitting, submit } = useBatchSubmission(submitOrdering, () => {
    focusFirstElement(formRef.current)
    setWords(EmptyWords)
  })

  const isSubmittable = !isSubmitting && words.filter(Boolean).length >= MIN_ORDERING_WORD_COUNT

  function save(): void {
    if (!isSubmittable) {
      return
    }
    submit(words)
  }

  return { formRef, words, setWords, results, isSubmitting, isSubmittable, save }
}
