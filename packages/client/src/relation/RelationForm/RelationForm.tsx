import type { FormEvent, ReactElement } from 'react'
import { FieldEdge, FieldRow } from '../FieldRow/FieldRow'
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
  hasRandomPick?: boolean
}

export function RelationForm({ editor, hasRandomPick }: RelationFormProps): ReactElement {
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

  const subjectWordFields = (
    <SubjectWordFields
      words={words}
      requiredCount={SubjectWordSpecs[type].minCount}
      isCountAdjustable={SubjectWordSpecs[type].isCountAdjustable}
      layout={SubjectWordSpecs[type].layout}
      placeholders={SubjectWordSpecs[type].placeholders}
      hasRandomPick={hasRandomPick}
      onChange={editor.setWords}
    />
  )

  function renderAnswer(): ReactElement | null {
    if (type === 'NamedAssociation') {
      return null
    }
    if (type === 'TernaryIsolation' && !isWordsReady) {
      return <p>대상 단어를 먼저 입력하세요</p>
    }
    return <AnswerSection draft={draft} answer={answer} onChange={editor.setAnswer} />
  }

  function renderQuestion(): ReactElement {
    if (type === 'TernaryComposition') {
      return (
        <FieldRow>
          {subjectWordFields}
          <FieldEdge>=</FieldEdge>
          {renderAnswer()}
        </FieldRow>
      )
    }
    return (
      <>
        {subjectWordFields}
        {renderAnswer()}
      </>
    )
  }

  return (
    <form ref={editor.formRef} onSubmit={handleSubmit}>
      <p>{getQuestionPrompt(draft.question)}</p>
      {renderQuestion()}
      <h6>참고사항</h6>
      <TextWriterField
        name="commentMode"
        modes={TextWriterModes}
        mode={comment.mode}
        value={comment.text}
        placeholder="(optional)"
        onModeChange={(mode) => editor.setComment({ ...comment, mode })}
        onChange={(text) => editor.setComment({ ...comment, text })}
        onComplete={save}
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
