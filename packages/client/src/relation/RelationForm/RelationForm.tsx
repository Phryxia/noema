import type { FormEvent, ReactElement } from 'react'
import { FieldEdge, FieldRow } from '../FieldRow/FieldRow'
import { RelationActions } from '../RelationActions/RelationActions'
import { SubjectWordFields } from '../SubjectWordFields/SubjectWordFields'
import { QuestionSpecs } from '../questionSpecs'
import type { RelationEditor } from '../useRelationEditor'
import { BatchWordFields } from '../batch/BatchWordFields'
import type { BatchRelationEditor } from '../batch/useBatchRelationEditor'
import { AnswerSection } from '../../explore/AnswerSection/AnswerSection'
import { TextWriterField } from '../../explore/TextWriterField/TextWriterField'
import { getQuestionPrompt } from '../../explore/getQuestionPrompt'
import { TextWriterModes } from '../../writer/consts'

interface RelationFormProps {
  editor: RelationEditor
  batch?: BatchRelationEditor
  hasRandomPick?: boolean
}

export function RelationForm({
  editor,
  batch,
  hasRandomPick,
}: RelationFormProps): ReactElement {
  const { type, draft, words, answer, comment, isWordsReady, isDeleting, remove } = editor
  const activeBatch = batch?.isActive ? batch : null
  const { isSubmitting, isSubmittable, save } = activeBatch ?? editor

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  const { subject, answer: answerSpec } = QuestionSpecs[type]
  const subjectWordFields = (
    <SubjectWordFields
      words={words}
      requiredCount={subject.minCount}
      isCountAdjustable={subject.isCountAdjustable}
      layout={subject.layout}
      placeholders={subject.placeholders}
      hasRandomPick={hasRandomPick}
      onChange={editor.setWords}
    />
  )

  function renderAnswer(): ReactElement | null {
    if (answerSpec.kind === 'none') {
      return null
    }
    if (answerSpec.kind === 'selection' && !isWordsReady) {
      return <p>대상 단어를 먼저 입력하세요</p>
    }
    return <AnswerSection draft={draft} answer={answer} onChange={editor.setAnswer} />
  }

  function renderQuestion(): ReactElement {
    if (activeBatch) {
      return (
        <BatchWordFields
          texts={activeBatch.texts}
          onChange={activeBatch.setText}
          onSubmit={activeBatch.save}
        />
      )
    }
    if (answerSpec.kind === 'words' && answerSpec.layout === 'composition') {
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
      {!activeBatch && (
        <>
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
        </>
      )}
      <RelationActions
        isSubmitting={isSubmitting}
        isSubmittable={isSubmittable}
        isDeleting={isDeleting}
        onDelete={remove}
      />
    </form>
  )
}
