import type { FormEvent, ReactElement } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { SourceField } from '../../writer/SourceField/SourceField'
import { SentenceField } from '../SentenceField/SentenceField'
import { createSentence, deleteSentence, updateSentence } from '../sentence.service'
import { invalidateSentenceQueries } from '../utils'
import type { Sentence } from '../types'

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
  const { draft, setDraft, canSave, save, remove } = useWriterForm({
    isEditable,
    isEditing: !!sentence,
    initialDraft: { value: sentence?.value ?? '', source: sentence?.source ?? '' },
    saveDraft: ({ value, source }): Promise<void> => submitSentence(sentence, value, source),
    saveSuccessMessage: '문장을 저장했습니다',
    deleteItem: sentence ? (): Promise<void> => deleteSentence(sentence.sentenceId) : undefined,
    deleteSuccessMessage: '문장을 삭제했습니다',
    invalidateQueries: invalidateSentenceQueries,
    onDeleted: onDelete,
  })

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
