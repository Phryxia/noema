import type { FormEvent, ReactElement } from 'react'
import { SubjectWordFields } from '../SubjectWordFields/SubjectWordFields'
import { SubjectWordSpecs } from '../consts'
import type { RelationEditor } from '../useRelationEditor'
import { AnswerSection } from '../../explore/AnswerSection/AnswerSection'
import { TextWriterField } from '../../explore/TextWriterField/TextWriterField'
import { getQuestionPrompt } from '../../explore/getQuestionPrompt'
import { TextWriterModes } from '../../writer/consts'

interface RelationFormProps {
  editor: RelationEditor
}

export function RelationForm({ editor }: RelationFormProps): ReactElement {
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
  } = editor

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
        onChange={editor.setWords}
      />
      {type === 'TernaryIsolation' && !isWordsReady ? (
        <p>대상 단어를 먼저 입력하세요</p>
      ) : (
        <AnswerSection
          draft={draft}
          answer={answer}
          onChange={editor.setAnswer}
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
        onModeChange={(mode) => editor.setComment({ ...comment, mode })}
        onChange={(text) => editor.setComment({ ...comment, text })}
        onSubmit={save}
      />
      <button type="submit" disabled={!isSubmittable} aria-busy={isSubmitting}>
        {!isSubmitting && '제출'}
      </button>
    </form>
  )
}
