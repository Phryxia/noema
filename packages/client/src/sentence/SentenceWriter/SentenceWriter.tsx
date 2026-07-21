import type { FormEvent, KeyboardEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WhitespaceEcho } from '../../writer/WhitespaceEcho/WhitespaceEcho'
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
    initialDraft: { value: sentence?.value ?? '' },
    saveDraft: ({ value }): Promise<void> => submitSentence(sentence, value),
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
      <div className={cx('textareaWrapper')}>
        <textarea
          className={cx('textarea')}
          value={draft.value}
          readOnly={!isEditable}
          onChange={(event) => setDraft({ value: event.target.value })}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          onKeyDown={handleKeyDown}
        />
        <WhitespaceEcho value={draft.value} isMultiline scrollLeft={0} scrollTop={scrollTop} />
      </div>
      {isEditable && (
        <div className={cx('actions')}>
          <button type="submit" className={cx('action')} disabled={!canSave}>
            {sentence ? '수정' : '저장'}
          </button>
          {sentence && (
            <button type="button" className={cx('action', 'secondary')} onClick={remove}>
              삭제
            </button>
          )}
        </div>
      )}
    </form>
  )
}

async function submitSentence(sentence: Sentence | undefined, value: string): Promise<void> {
  if (sentence) {
    await updateSentence(sentence.sentenceId, value)
    return
  }
  await createSentence(value)
}
