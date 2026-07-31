import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkIsAnswerReady } from './checkIsAnswerReady'
import {
  CHECKED_TYPES_STORAGE_KEY,
  EmptyAnswer,
  EmptyComment,
  EXPLORE_QUESTION_QUERY_KEY,
  QuestionTypeSpecs,
} from './consts'
import { pickQuestion } from './pickQuestion'
import { submitAnswer } from './submitAnswer'
import type { SubmitAnswerParams } from './submitAnswer'
import type { AnswerDraft, CommentDraft, QuestionPick } from './types'
import type { QuestionType } from '../question/types'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateWordQueries } from '../word/utils'

const AllQuestionTypes: QuestionType[] = QuestionTypeSpecs.map(({ type }) => type)

export interface ExploreOptions {
  fixedTypes?: QuestionType[]
  pickQuestion?: (types: QuestionType[]) => Promise<QuestionPick>
  queryKey?: string
  onSaved?: (params: SubmitAnswerParams) => void
}

export interface Explore {
  checkedTypes: QuestionType[]
  setCheckedTypes: (checkedTypes: QuestionType[]) => void
  answer: AnswerDraft
  setAnswer: (answer: AnswerDraft) => void
  comment: CommentDraft
  setComment: (comment: CommentDraft) => void
  pick: QuestionPick | undefined
  isFetching: boolean
  isSubmitting: boolean
  isSubmittable: boolean
  skip: () => void
  save: () => void
}

export function useExplore(isEnabled: boolean, options?: ExploreOptions): Explore {
  const fixedTypes = options?.fixedTypes
  const [checkedTypes, setCheckedTypes] = useState<QuestionType[]>(
    () => fixedTypes ?? loadCheckedTypes(),
  )
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const appliedTypes = useRef<QuestionType[]>(checkedTypes)
  const queryClient = useQueryClient()

  const {
    data: pick,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [options?.queryKey ?? EXPLORE_QUESTION_QUERY_KEY],
    queryFn: () => (options?.pickQuestion ?? pickQuestion)(appliedTypes.current),
    enabled: isEnabled,
    staleTime: Infinity,
    gcTime: 0,
  })

  function draw(types: QuestionType[]): void {
    setAnswer(EmptyAnswer)
    setComment(EmptyComment)
    appliedTypes.current = types
    void refetch()
  }

  function skip(): void {
    draw(checkedTypes)
  }

  function updateCheckedTypes(types: QuestionType[]): void {
    setCheckedTypes(types)
    if (!fixedTypes) {
      saveCheckedTypes(types)
    }
    if (pick?.status === 'ok') {
      return
    }
    draw(types)
  }

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (_, params) => {
      options?.onSaved?.(params)
      invalidateWordQueries(queryClient)
      invalidateSentenceQueries(queryClient)
      skip()
    },
  })

  const draft = pick?.status === 'ok' ? pick.draft : undefined
  const isSubmittable =
    !!draft && !isFetching && !isSubmitting && checkIsAnswerReady(draft.question, answer)

  function save(): void {
    if (!isSubmittable) {
      return
    }
    submit({ question: draft.question, answer, comment })
  }

  return {
    checkedTypes,
    setCheckedTypes: updateCheckedTypes,
    answer,
    setAnswer,
    comment,
    setComment,
    pick,
    isFetching,
    isSubmitting,
    isSubmittable,
    skip,
    save,
  }
}

function loadCheckedTypes(): QuestionType[] {
  const raw = localStorage.getItem(CHECKED_TYPES_STORAGE_KEY)
  if (!raw) {
    return AllQuestionTypes
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return AllQuestionTypes
    }
    return AllQuestionTypes.filter((type) => parsed.includes(type))
  } catch {
    return AllQuestionTypes
  }
}

function saveCheckedTypes(types: QuestionType[]): void {
  localStorage.setItem(CHECKED_TYPES_STORAGE_KEY, JSON.stringify(types))
}
