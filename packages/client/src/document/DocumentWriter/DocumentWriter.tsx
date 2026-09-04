import type { DragEvent, FormEvent, KeyboardEvent, ReactElement, ReactNode } from 'react'
import { useCallback } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { SourceField } from '../../writer/SourceField/SourceField'
import { insertTabIfPressed } from '../../writer/insertTabIfPressed'
import { invalidateRelationQueries } from '../../relation/utils'
import { createInitialTagValues } from '../../tag/createInitialTagValues'
import { TagEditor } from '../../tag/TagEditor/TagEditor'
import type { TagEntry, TagResult } from '../../tag/types'
import { useTagResults } from '../../tag/useTagResults'
import { deleteDocument } from '../document.service'
import type { Document, DocumentTitleEntry } from '../types'
import { submitDocument } from './submitDocument'
import type { DocumentDraft } from './submitDocument'
import { TitleField } from './TitleField'
import classnames from 'classnames/bind'
import styles from './DocumentWriter.module.css'

const cx = classnames.bind(styles)

interface DocumentWriterProps {
  isEditable: boolean
  document?: Document
  title?: DocumentTitleEntry
  tags?: TagEntry[]
  onDelete?: () => void
  renderPreview?: (value: string) => ReactNode
}

export function DocumentWriter({
  isEditable,
  document,
  title,
  tags = [],
  onDelete,
  renderPreview,
}: DocumentWriterProps): ReactElement {
  const initialTitle = title?.sentence.value ?? ''
  const initialTags = createInitialTagValues(tags)
  const { showResults, dialog } = useTagResults()
  const { draft, setDraft, resetKey, canSave, save, remove } = useWriterForm<
    DocumentDraft,
    TagResult[]
  >({
    isEditable,
    isEditing: !!document,
    initialDraft: {
      title: initialTitle,
      value: document?.value ?? '',
      source: document?.source ?? '',
      tags: initialTags,
    },
    checkIsComplete: (target): boolean => !!target.title && !!target.value,
    saveDraft: (next): Promise<TagResult[]> =>
      submitDocument(document, initialTitle, tags, next),
    saveSuccessMessage: '문서를 저장했습니다',
    deleteItem: document ? (): Promise<void> => deleteDocument(document.documentId) : undefined,
    deleteSuccessMessage: '문서를 삭제했습니다',
    invalidateQueries: invalidateRelationQueries,
    onSaved: showResults,
    onDeleted: onDelete,
  })
  const handleTagsChange = useCallback(
    (nextTags: string[]) => setDraft((current) => ({ ...current, tags: nextTags })),
    [setDraft],
  )

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
    setDraft({ ...draft, value: await file.text(), source: file.name })
  }

  function renderBodyField(): ReactElement {
    return (
      <textarea
        className={cx('textarea')}
        value={draft.value}
        readOnly={!isEditable}
        onChange={(event) => setDraft({ ...draft, value: event.target.value })}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      />
    )
  }

  return (
    <form className={cx('root')} onSubmit={handleSubmit}>
      <TitleField
        value={draft.title}
        isEditable={isEditable}
        onChange={(nextTitle) => setDraft({ ...draft, title: nextTitle })}
        onSubmit={save}
      />
      <SourceField
        value={draft.source}
        isEditable={isEditable}
        onChange={(source) => setDraft({ ...draft, source })}
      />
      {renderPreview ? (
        <div className={cx('bodyRow')}>
          {renderBodyField()}
          <div className={cx('preview')}>{renderPreview(draft.value)}</div>
        </div>
      ) : (
        renderBodyField()
      )}
      <TagEditor
        key={resetKey}
        initialValues={initialTags}
        isEditable={isEditable}
        onChange={handleTagsChange}
      />
      {isEditable && (
        <WriterActions isEditing={!!document} canSave={canSave} onDelete={remove} />
      )}
      {dialog}
    </form>
  )
}
