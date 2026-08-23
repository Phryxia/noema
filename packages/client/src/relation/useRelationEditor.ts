import { useRef, useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkIsAnswerReady } from '../explore/checkIsAnswerReady'
import { EmptyAnswer, EmptyComment } from '../explore/consts'
import type { AnswerDraft, CommentDraft, QuestionDraft } from '../explore/types'
import { checkSubjectWordsReady } from './checkSubjectWordsReady'
import { SubjectWordSpecs } from './consts'
import { createEmptyWords } from './createEmptyWords'
import { createRelationDraft } from './createRelationDraft'
import { resizeWords } from './resizeWords'
import { saveType } from './typeStorage'
import type { WordRelationType } from './types'
import { invalidateRelationQueries } from './utils'
import { focusFirstElement } from '../utils/focusFirstElement'

export interface RelationValues {
  type: WordRelationType
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export interface RelationEditorOptions {
  getInitial: () => RelationValues
  isTypeEditable: boolean
  isResetOnSave: boolean
  persist: (values: RelationValues) => Promise<void>
  remove?: () => Promise<void>
  onRemoved?: () => void
}

export interface RelationEditor {
  type: WordRelationType
  setType: (type: WordRelationType) => void
  words: string[]
  setWords: Dispatch<SetStateAction<string[]>>
  answer: AnswerDraft
  setAnswer: (answer: AnswerDraft) => void
  comment: CommentDraft
  setComment: (comment: CommentDraft) => void
  draft: QuestionDraft
  formRef: RefObject<HTMLFormElement | null>
  isTypeEditable: boolean
  isWordsReady: boolean
  isSubmitting: boolean
  isSubmittable: boolean
  isDeleting: boolean
  save: () => void
  remove: (() => void) | null
}

export function useRelationEditor({
  getInitial,
  isTypeEditable,
  isResetOnSave,
  persist,
  remove,
  onRemoved,
}: RelationEditorOptions): RelationEditor {
  const [initial] = useState(getInitial)
  const [type, setType] = useState<WordRelationType>(initial.type)
  const [words, setWords] = useState<string[]>(initial.words)
  const [answer, setAnswer] = useState<AnswerDraft>(initial.answer)
  const [comment, setComment] = useState<CommentDraft>(initial.comment)
  const formRef = useRef<HTMLFormElement>(null)
  const queryClient = useQueryClient()

  function updateType(nextType: WordRelationType): void {
    setType(nextType)
    saveType(nextType)
    setWords(resizeWords(words, SubjectWordSpecs[nextType].count))
    setAnswer(EmptyAnswer)
  }

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: persist,
    meta: { successMessage: '관계를 저장했습니다' },
    onSuccess: () => {
      invalidateRelationQueries(queryClient)
      if (!isResetOnSave) {
        return
      }
      setWords(createEmptyWords(type))
      setAnswer(EmptyAnswer)
      setComment(EmptyComment)
      focusFirstElement(formRef.current)
    },
  })

  const { mutate: submitRemoval, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await remove?.()
    },
    meta: { successMessage: '관계를 삭제했습니다' },
    onSuccess: () => {
      invalidateRelationQueries(queryClient)
      onRemoved?.()
    },
  })

  const draft = createRelationDraft(type, words)
  const isWordsReady = checkSubjectWordsReady(type, words)
  const isSubmittable =
    isWordsReady && !isSubmitting && !isDeleting && checkIsAnswerReady(draft.question, answer)

  function save(): void {
    if (!isSubmittable) {
      return
    }
    submit({ type, words, answer, comment })
  }

  return {
    type,
    setType: updateType,
    words,
    setWords,
    answer,
    setAnswer,
    comment,
    setComment,
    draft,
    formRef,
    isTypeEditable,
    isWordsReady,
    isSubmitting,
    isSubmittable,
    isDeleting,
    save,
    remove: remove ? (): void => submitRemoval() : null,
  }
}
