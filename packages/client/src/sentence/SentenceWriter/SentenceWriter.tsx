import type { FormEvent, ReactElement } from 'react'
import { useCallback } from 'react'
import { checkIsBodyChanged } from '../../writer/checkIsBodyChanged'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { SourceField } from '../../writer/SourceField/SourceField'
import { confirmRelationImpact } from '../../relation/confirmRelationImpact'
import { invalidateRelationQueries } from '../../relation/utils'
import { createInitialTagValues } from '../../tag/createInitialTagValues'
import { submitTags } from '../../tag/submitTags'
import { TagEditor } from '../../tag/TagEditor/TagEditor'
import type { TagEntry, TagResult } from '../../tag/types'
import { useTagResults } from '../../tag/useTagResults'
import { SentenceField } from '../SentenceField/SentenceField'
import { createSentence, deleteSentence, updateSentence } from '../sentence.service'
import type { Sentence } from '../types'

interface SentenceWriterProps {
  isEditable: boolean
  sentence?: Sentence
  tags?: TagEntry[]
  onDelete?: () => void
}

interface SentenceDraft {
  value: string
  source: string
  tags: string[]
}

export function SentenceWriter({
  isEditable,
  sentence,
  tags = [],
  onDelete,
}: SentenceWriterProps): ReactElement {
  const initialTags = createInitialTagValues(tags)
  const { showResults, dialog } = useTagResults()
  const { draft, setDraft, resetKey, canSave, save, remove } = useWriterForm<
    SentenceDraft,
    TagResult[]
  >({
    isEditable,
    isEditing: !!sentence,
    initialDraft: {
      value: sentence?.value ?? '',
      source: sentence?.source ?? '',
      tags: initialTags,
    },
    confirmSave: sentence
      ? (next): Promise<boolean> => confirmIfBodyChanged(next, sentence)
      : undefined,
    saveDraft: (next): Promise<TagResult[]> => submitSentence(sentence, tags, next),
    saveSuccessMessage: '문장을 저장했습니다',
    deleteItem: sentence ? (): Promise<void> => deleteSentence(sentence.sentenceId) : undefined,
    deleteSuccessMessage: '문장을 삭제했습니다',
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

  return (
    <form onSubmit={handleSubmit}>
      <SourceField
        value={draft.source}
        isEditable={isEditable}
        onChange={(source) => setDraft({ ...draft, source })}
      />
      <SentenceField
        value={draft.value}
        isEditable={isEditable}
        onChange={(value) => setDraft({ ...draft, value })}
        onSubmit={save}
      />
      <TagEditor
        key={resetKey}
        initialValues={initialTags}
        isEditable={isEditable}
        onChange={handleTagsChange}
      />
      {isEditable && (
        <WriterActions isEditing={!!sentence} canSave={canSave} onDelete={remove} />
      )}
      {dialog}
    </form>
  )
}

async function confirmIfBodyChanged(
  draft: SentenceDraft,
  sentence: Sentence,
): Promise<boolean> {
  if (!checkIsBodyChanged(draft, sentence)) {
    return true
  }
  return confirmRelationImpact({ type: 'sentence', id: sentence.sentenceId })
}

async function submitSentence(
  sentence: Sentence | undefined,
  tags: TagEntry[],
  draft: SentenceDraft,
): Promise<TagResult[]> {
  const sentenceId = await saveSentence(sentence, draft)
  return submitTags({ type: 'sentence', id: sentenceId }, tags, draft.tags)
}

async function saveSentence(
  sentence: Sentence | undefined,
  draft: SentenceDraft,
): Promise<number> {
  if (!sentence) {
    return createSentence(draft.value, draft.source)
  }
  if (checkIsBodyChanged(draft, sentence)) {
    await updateSentence(sentence.sentenceId, draft.value, draft.source)
  }
  return sentence.sentenceId
}
