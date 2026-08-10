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
  QuestionTypeOptions,
} from './consts'
import { pickQuestion } from './pickQuestion'
import { submitAnswer } from './submitAnswer'
import { loadUsageWordCount, saveUsageWordCount } from './usageWordCountStorage'
import type { SubmitAnswerParams } from './submitAnswer'
import type { AnswerDraft, CommentDraft, QuestionPick } from './types'
import type { QuestionType } from '../question/types'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateWordQueries } from '../word/utils'
import { focusFirstElement } from '../utils/focusFirstElement'

const AllQuestionTypes: QuestionType[] = QuestionTypeOptions.map(({ value }) => value)

export interface ExploreOptions {
  availableTypes?: QuestionType[]
  checkedTypesStorageKey?: string
  pickQuestion?: (types: QuestionType[], usageWordCount: number) => Promise<QuestionPick>
  queryKey?: string
  onSaved?: (params: SubmitAnswerParams) => void
}

export interface Explore {
  checkedTypes: QuestionType[]
  setCheckedTypes: (checkedTypes: QuestionType[]) => void
  usageWordCount: number
  setUsageWordCount: (count: number) => void
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
  const [usageWordCount, setUsageWordCount] = useState(loadUsageWordCount)
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const appliedTypes = useRef<QuestionType[]>(checkedTypes)
  const appliedUsageWordCount = useRef(usageWordCount)
  const answerRef = useRef<HTMLDivElement>(null)
  const isFocusPending = useRef(false)
  const queryClient = useQueryClient()

  const {
    data: pick,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [options?.queryKey ?? EXPLORE_QUESTION_QUERY_KEY],
    queryFn: () =>
      (options?.pickQuestion ?? pickQuestion)(
        appliedTypes.current,
        appliedUsageWordCount.current,
      ),
    enabled: isEnabled,
    staleTime: Infinity,
    gcTime: 0,
  })

  function draw(types: QuestionType[], count: number): void {
    setAnswer(EmptyAnswer)
    setComment(EmptyComment)
    appliedTypes.current = types
    appliedUsageWordCount.current = count
    void refetch()
  }

  function skip(): void {
    draw(checkedTypes, usageWordCount)
  }

  function updateCheckedTypes(types: QuestionType[]): void {
    setCheckedTypes(types)
    saveCheckedTypes(storageKey, types)
    if (pick?.status === 'ok') {
      return
    }
    draw(types, usageWordCount)
  }

  function updateUsageWordCount(count: number): void {
    setUsageWordCount(count)
    saveUsageWordCount(count)
    if (pick?.status === 'ok') {
      return
    }
    draw(checkedTypes, count)
  }

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitAnswer,
    meta: { successMessage: '답변을 저장했습니다' },
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
    usageWordCount,
    setUsageWordCount: updateUsageWordCount,
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
