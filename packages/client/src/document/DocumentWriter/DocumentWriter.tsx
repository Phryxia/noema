import type { DragEvent, FormEvent, KeyboardEvent, ReactElement } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { insertTabIfPressed } from '../../writer/insertTabIfPressed'
import { createDocument, deleteDocument, updateDocument } from '../document.service'
import { invalidateDocumentQueries } from '../utils'
import type { Document } from '../types'
import classnames from 'classnames/bind'
import styles from './DocumentWriter.module.css'

const cx = classnames.bind(styles)

interface DocumentWriterProps {
  isEditable: boolean
  document?: Document
  onDelete?: () => void
}

export function DocumentWriter({
  isEditable,
  document,
  onDelete,
}: DocumentWriterProps): ReactElement {
  const { draft, setDraft, canSave, save, remove } = useWriterForm({
    isEditable,
    isEditing: !!document,
    initialDraft: { value: document?.value ?? '', source: document?.source ?? '' },
    saveDraft: ({ value, source }): Promise<void> => submitDocument(document, value, source),
    deleteItem: document ? (): Promise<void> => deleteDocument(document.documentId) : undefined,
    invalidateQueries: invalidateDocumentQueries,
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

  async function handleDrop(event: DragEvent<HTMLTextAreaElement>): Promise<void> {
    const file = event.dataTransfer.files[0]
    if (!isEditable || !file) {
      return
    }
    event.preventDefault()
    setDraft({ value: await file.text(), source: file.name })
  }

  return (
    <form className={cx('root')} onSubmit={handleSubmit}>
      <label>
        출처
        <input
          className={cx('source')}
          type="text"
          placeholder="출처"
          value={draft.source}
          readOnly={!isEditable}
          onChange={(event) => setDraft({ ...draft, source: event.target.value })}
        />
      </label>
      <textarea
        className={cx('textarea')}
        value={draft.value}
        readOnly={!isEditable}
        onChange={(event) => setDraft({ ...draft, value: event.target.value })}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      />
      {isEditable && (
        <WriterActions isEditing={!!document} canSave={canSave} onDelete={remove} />
      )}
    </form>
  )
}

async function submitDocument(
  document: Document | undefined,
  value: string,
  source: string,
): Promise<void> {
  if (document) {
    await updateDocument(document.documentId, value, source)
    return
  }
  await createDocument(value, source)
}
