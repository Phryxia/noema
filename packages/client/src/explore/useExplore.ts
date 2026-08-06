import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkIsAnswerReady } from './checkIsAnswerReady'
import {
  ANSWER_INPUT_SELECTOR,
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
import { focusFirstElement } from '../utils/focusFirstElement'

const AllQuestionTypes: QuestionType[] = QuestionTypeSpecs.map(({ type }) => type)

export interface ExploreOptions {
  availableTypes?: QuestionType[]
  checkedTypesStorageKey?: string
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
  answerRef: RefObject<HTMLDivElement | null>
  isFetching: boolean
  isSubmitting: boolean
  isSubmittable: boolean
  skip: () => void
  save: () => void
}

export function useExplore(isEnabled: boolean, options?: ExploreOptions): Explore {
  const availableTypes = options?.availableTypes ?? AllQuestionTypes
  const storageKey = options?.checkedTypesStorageKey ?? CHECKED_TYPES_STORAGE_KEY
  const [checkedTypes, setCheckedTypes] = useState<QuestionType[]>(() =>
    loadCheckedTypes(availableTypes, storageKey),
  )
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const appliedTypes = useRef<QuestionType[]>(checkedTypes)
  const answerRef = useRef<HTMLDivElement>(null)
  const isFocusPending = useRef(false)
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
    saveCheckedTypes(storageKey, types)
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
      isFocusPending.current = true
      skip()
    },
  })

  useEffect(() => {
    if (!isFocusPending.current || isFetching || pick?.status !== 'ok') {
      return
    }
    isFocusPending.current = false
    focusFirstElement(answerRef.current, ANSWER_INPUT_SELECTOR)
  }, [isFetching, pick])

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
    answerRef,
    isFetching,
    isSubmitting,
    isSubmittable,
    skip,
    save,
  }
}

function loadCheckedTypes(availableTypes: QuestionType[], storageKey: string): QuestionType[] {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return availableTypes
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return availableTypes
    }
    return availableTypes.filter((type) => parsed.includes(type))
  } catch {
    return availableTypes
  }
}

function saveCheckedTypes(storageKey: string, types: QuestionType[]): void {
  localStorage.setItem(storageKey, JSON.stringify(types))
}
