import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkSubjectWordsReady } from './checkSubjectWordsReady'
import { SubjectWordSpecs, TEACH_TYPE_STORAGE_KEY } from './consts'
import { createRelationDraft } from './createRelationDraft'
import { submitRelation } from './submitRelation'
import { checkIsAnswerReady } from '../explore/checkIsAnswerReady'
import { EmptyAnswer, EmptyComment, QuestionTypeSpecs } from '../explore/consts'
import type { AnswerDraft, CommentDraft, QuestionDraft } from '../explore/types'
import type { QuestionType } from '../question/types'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateWordQueries } from '../word/utils'

export interface RelationEditor {
  type: QuestionType
  setType: (type: QuestionType) => void
  words: string[]
  setWords: (words: string[]) => void
  answer: AnswerDraft
  setAnswer: (answer: AnswerDraft) => void
  comment: CommentDraft
  setComment: (comment: CommentDraft) => void
  draft: QuestionDraft
  isWordsReady: boolean
  isSubmitting: boolean
  isSubmittable: boolean
  save: () => void
}

export function useRelationEditor(): RelationEditor {
  const [type, setType] = useState<QuestionType>(loadType)
  const [words, setWords] = useState<string[]>(() => createEmptyWords(type))
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const queryClient = useQueryClient()

  function updateType(nextType: QuestionType): void {
    setType(nextType)
    saveType(nextType)
    setWords(resizeWords(words, SubjectWordSpecs[nextType].count))
    setAnswer(EmptyAnswer)
  }

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitRelation,
    onSuccess: () => {
      invalidateWordQueries(queryClient)
      invalidateSentenceQueries(queryClient)
      setWords(createEmptyWords(type))
      setAnswer(EmptyAnswer)
      setComment(EmptyComment)
    },
  })

  const draft = createRelationDraft(type, words)
  const isWordsReady = checkSubjectWordsReady(type, words)
  const isSubmittable =
    isWordsReady && !isSubmitting && checkIsAnswerReady(draft.question, answer)

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
    isWordsReady,
    isSubmitting,
    isSubmittable,
    save,
  }
}

function loadType(): QuestionType {
  const raw = localStorage.getItem(TEACH_TYPE_STORAGE_KEY)
  const spec = QuestionTypeSpecs.find(({ type }) => type === raw)
  return spec?.type ?? QuestionTypeSpecs[0].type
}

function saveType(type: QuestionType): void {
  localStorage.setItem(TEACH_TYPE_STORAGE_KEY, type)
}

function createEmptyWords(type: QuestionType): string[] {
  return Array.from({ length: SubjectWordSpecs[type].count }, () => '')
}

function resizeWords(words: string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => words[index] ?? '')
}
