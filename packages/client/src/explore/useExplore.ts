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
import type { WordRelationType } from '../relation/types'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateWordQueries } from '../word/utils'
import { focusFirstElement } from '../utils/focusFirstElement'

const AllQuestionTypes: WordRelationType[] = QuestionTypeOptions.map(({ value }) => value)

export interface ExploreOptions {
  availableTypes?: WordRelationType[]
  onSaved?: (params: SubmitAnswerParams) => void
}

export interface Explore {
  checkedTypes: WordRelationType[]
  setCheckedTypes: (checkedTypes: WordRelationType[]) => void
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
  const [checkedTypes, setCheckedTypes] = useState<WordRelationType[]>(() =>
    loadCheckedTypes(availableTypes),
  )
  const [usageWordCount, setUsageWordCount] = useState(loadUsageWordCount)
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const appliedTypes = useRef<WordRelationType[]>(checkedTypes)
  const appliedUsageWordCount = useRef(usageWordCount)
  const answerRef = useRef<HTMLDivElement>(null)
  const isFocusPending = useRef(false)
  const queryClient = useQueryClient()

  const {
    data: pick,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [EXPLORE_QUESTION_QUERY_KEY],
    queryFn: () => pickQuestion(appliedTypes.current, appliedUsageWordCount.current),
    enabled: isEnabled,
    staleTime: Infinity,
    gcTime: 0,
  })

  function draw(types: WordRelationType[], count: number): void {
    setAnswer(EmptyAnswer)
    setComment(EmptyComment)
    appliedTypes.current = types
    appliedUsageWordCount.current = count
    void refetch()
  }

  function skip(): void {
    draw(checkedTypes, usageWordCount)
  }

  function updateCheckedTypes(types: WordRelationType[]): void {
    setCheckedTypes(types)
    saveCheckedTypes(types)
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

function loadCheckedTypes(availableTypes: WordRelationType[]): WordRelationType[] {
  const raw = localStorage.getItem(CHECKED_TYPES_STORAGE_KEY)
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

function saveCheckedTypes(types: WordRelationType[]): void {
  localStorage.setItem(CHECKED_TYPES_STORAGE_KEY, JSON.stringify(types))
}
