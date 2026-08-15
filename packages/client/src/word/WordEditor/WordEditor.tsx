import type { FormEvent, ReactElement } from 'react'
import { useRef } from 'react'
import { useWriterForm } from '../../writer/useWriterForm'
import { WriterActions } from '../../writer/WriterActions/WriterActions'
import { confirmRelationImpact } from '../../relation/confirmRelationImpact'
import { deleteWordReplacingReferences } from '../deleteWordReplacingReferences'
import { updateWord } from '../updateWord'
import { deleteWord } from '../word.service'
import { invalidateWordAndQnaQueries } from '../utils'
import { useGuardedWordDeletion } from '../useGuardedWordDeletion'
import { WordField } from '../WordField/WordField'
import { WordReplaceDialog } from '../WordReplaceDialog/WordReplaceDialog'
import { WordSuggestion } from '../WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../useSuggestionFocus'
import type { TrieNode } from '../types'

interface WordEditorProps {
  node: TrieNode
  word: string
  onRenamed: (newValue: string) => void
  onDeleted: () => void
}

export function WordEditor({
  node,
  word,
  onRenamed,
  onDeleted,
}: WordEditorProps): ReactElement {
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
  } = useSuggestionFocus()
  const replacementRef = useRef<string | null>(null)

  const { draft, setDraft, canSave, save, remove } = useWriterForm({
    isEditable: true,
    isEditing: true,
    initialDraft: { value: word },
    confirmSave: () => confirmRelationImpact({ type: 'word', id: node.nodeId }),
    saveDraft: (draft) => submitWord(node.nodeId, draft.value, onRenamed),
    saveSuccessMessage: '단어를 수정했습니다',
    deleteItem,
    deleteSuccessMessage: '단어를 삭제했습니다',
    invalidateQueries: invalidateWordAndQnaQueries,
    onDeleted,
  })
  const { pendingWord, requestDelete, cancelReplace, confirmReplace } = useGuardedWordDeletion(
    (_, replacementValue) => {
      replacementRef.current = replacementValue
      remove()
    },
  )

  function deleteItem(): Promise<void> {
    const replacementValue = replacementRef.current
    if (replacementValue) {
      return deleteWordReplacingReferences(node.nodeId, replacementValue)
    }
    return deleteWord(node.nodeId)
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div ref={rootRef} onFocus={handleFocus} onBlur={handleBlur}>
          <WordField
            value={draft.value}
            isEditable
            onChange={(value) => setDraft({ value })}
            onArrowDown={focusSuggestion}
          />
          <WordSuggestion
            ref={suggestionRef}
            keyword={draft.value}
            n={16}
            isVisible={isFocused}
            onExitUp={focusField}
          />
        </div>
        <WriterActions
          isEditing
          canSave={canSave}
          onDelete={() => requestDelete({ nodeId: node.nodeId, value: word })}
        />
      </form>
      {pendingWord && (
        <WordReplaceDialog
          word={pendingWord.value}
          onCancel={cancelReplace}
          onReplace={confirmReplace}
        />
      )}
    </>
  )
}

async function submitWord(
  nodeId: number,
  value: string,
  onRenamed: (newValue: string) => void,
): Promise<void> {
  const result = await updateWord(nodeId, value)
  if (result.type === 'renamed' || result.type === 'merged') {
    onRenamed(value)
    return
  }
  if (result.type !== 'merge-required') {
    return
  }
  if (!window.confirm(`'${value}'는 이미 있는 단어입니다. 병합할까요?`)) {
    return
  }
  const merged = await updateWord(nodeId, value, true)
  if (merged.type === 'renamed' || merged.type === 'merged') {
    onRenamed(value)
  }
}
