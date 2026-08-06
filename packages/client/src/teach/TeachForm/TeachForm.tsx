import type { FormEvent, ReactElement } from 'react'
import { SubjectWordFields } from '../SubjectWordFields/SubjectWordFields'
import { SubjectWordSpecs } from '../consts'
import type { Teach } from '../useTeach'
import { AnswerSection } from '../../explore/AnswerSection/AnswerSection'
import { TextWriterField } from '../../explore/TextWriterField/TextWriterField'
import { getQuestionPrompt } from '../../explore/getQuestionPrompt'
import { TextWriterModes } from '../../writer/consts'

interface TeachFormProps {
  teach: Teach
}

export function TeachForm({ teach }: TeachFormProps): ReactElement {
  const {
    type,
    draft,
    words,
    answer,
    comment,
    isWordsReady,
    isSubmitting,
    isSubmittable,
    save,
  } = teach

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>{getQuestionPrompt(draft.question)}</p>
      <SubjectWordFields
        words={words}
        requiredCount={SubjectWordSpecs[type].minCount}
        onChange={teach.setWords}
      />
      {type === 'TernaryIsolation' && !isWordsReady ? (
        <p>대상 단어를 먼저 입력하세요</p>
      ) : (
        <AnswerSection
          draft={draft}
          answer={answer}
          onChange={teach.setAnswer}
          onSubmit={save}
        />
      )}
      <h6>참고사항</h6>
      <TextWriterField
        name="commentMode"
        modes={TextWriterModes}
        mode={comment.mode}
        value={comment.text}
        placeholder="(optional)"
        onModeChange={(mode) => teach.setComment({ ...comment, mode })}
        onChange={(text) => teach.setComment({ ...comment, text })}
        onSubmit={save}
      />
      <button type="submit" disabled={!isSubmittable} aria-busy={isSubmitting}>
        {!isSubmitting && '제출'}
      </button>
    </form>
  )
}
