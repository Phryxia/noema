import type { FormEvent, KeyboardEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { WhitespaceEcho } from '../../writer/WhitespaceEcho/WhitespaceEcho'
import { SourceField } from '../../writer/SourceField/SourceField'
import { insertTabIfPressed } from '../../writer/insertTabIfPressed'
import { createSentence, deleteSentence, updateSentence } from '../sentence.service'
import { invalidateSentenceQueries } from '../utils'
import type { Sentence } from '../types'
import classnames from 'classnames/bind'
import styles from './SentenceWriter.module.css'

const cx = classnames.bind(styles)

interface SentenceWriterProps {
  isEditable: boolean
  sentence?: Sentence
  onDelete?: () => void
}

export function SentenceWriter({
  isEditable,
  sentence,
  onDelete,
}: SentenceWriterProps): ReactElement {
  const [scrollTop, setScrollTop] = useState(0)
  const { draft, setDraft, canSave, save, remove } = useWriterForm({
    isEditable,
    isEditing: !!sentence,
    initialDraft: { value: sentence?.value ?? '', source: sentence?.source ?? '' },
    saveDraft: ({ value, source }): Promise<void> => submitSentence(sentence, value, source),
    deleteItem: sentence ? (): Promise<void> => deleteSentence(sentence.sentenceId) : undefined,
    invalidateQueries: invalidateSentenceQueries,
    onDeleted: onDelete,
  })

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (isEditable && insertTabIfPressed(event)) {
      return
    }
    if (event.key !== 'Enter' || !event.ctrlKey) {
      return
    }
    event.preventDefault()
    save()
  }

  return (
    <form onSubmit={handleSubmit}>
      <SourceField
        value={draft.source}
        isEditable={isEditable}
        onChange={(source) => setDraft({ ...draft, source })}
      />
      <div className={cx('textareaWrapper')}>
        <textarea
          className={cx('textarea')}
          value={draft.value}
          readOnly={!isEditable}
          onChange={(event) => setDraft({ ...draft, value: event.target.value })}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          onKeyDown={handleKeyDown}
        />
        <WhitespaceEcho value={draft.value} isMultiline scrollLeft={0} scrollTop={scrollTop} />
      </div>
      {isEditable && (
        <WriterActions isEditing={!!sentence} canSave={canSave} onDelete={remove} />
      )}
    </form>
  )
}

async function submitSentence(
  sentence: Sentence | undefined,
  value: string,
  source: string,
): Promise<void> {
  if (sentence) {
    await updateSentence(sentence.sentenceId, value, source)
    return
  }
  await createSentence(value, source)
}
