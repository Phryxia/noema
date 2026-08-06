import type { FormEvent, ReactElement } from 'react'
import { RelationActions } from '../RelationActions/RelationActions'
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
    isDeleting,
    save,
    remove,
  } = editor

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <form ref={editor.formRef} onSubmit={handleSubmit}>
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
      <RelationActions
        isSubmitting={isSubmitting}
        isSubmittable={isSubmittable}
        isDeleting={isDeleting}
        onDelete={remove}
      />
    </form>
  )
}
