import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkIsAnswerReady } from './checkIsAnswerReady'
import {
  EmptyAnswer,
  EmptyComment,
  EXPLORE_QUESTION_QUERY_KEY,
  QuestionTypeSpecs,
} from './consts'
import { pickQuestion } from './pickQuestion'
import { submitAnswer } from './submitAnswer'
import type { AnswerDraft, CommentDraft, QuestionPick } from './types'
import type { QuestionType } from '../question/types'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateWordQueries } from '../word/utils'

const AllQuestionTypes: QuestionType[] = QuestionTypeSpecs.map(({ type }) => type)

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

export function useExplore(isEnabled: boolean): Explore {
  const [checkedTypes, setCheckedTypes] = useState<QuestionType[]>(AllQuestionTypes)
  const [answer, setAnswer] = useState<AnswerDraft>(EmptyAnswer)
  const [comment, setComment] = useState<CommentDraft>(EmptyComment)
  const appliedTypes = useRef<QuestionType[]>(AllQuestionTypes)
  const queryClient = useQueryClient()

  const {
    data: pick,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [EXPLORE_QUESTION_QUERY_KEY],
    queryFn: () => pickQuestion(appliedTypes.current),
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
    if (pick?.status === 'ok') {
      return
    }
    draw(types)
  }

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: submitAnswer,
    onSuccess: () => {
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
