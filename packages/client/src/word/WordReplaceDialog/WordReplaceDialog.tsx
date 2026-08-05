import type { ReactElement } from 'react'
import { useState } from 'react'
import { WordField } from '../WordField/WordField'
import { WordSuggestion } from '../WordSuggestion/WordSuggestion'

interface WordReplaceDialogProps {
  word: string
  onCancel: () => void
  onReplace: (replacementValue: string) => void
}

export function WordReplaceDialog({
  word,
  onCancel,
  onReplace,
}: WordReplaceDialogProps): ReactElement {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const canReplace = !!value && value !== word

  return (
    <dialog open>
      <article>
        <h3>참조된 단어 삭제</h3>
        <p>
          '{word}'를 참조하는 관계가 있습니다. 참조를 대체할 단어를 입력하거나 삭제를
          취소하세요.
        </p>
        <WordField
          value={value}
          isEditable
          placeholder="대체할 단어"
          onChange={setValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <WordSuggestion
          keyword={value}
          n={8}
          isVisible={isFocused}
          isDeletable={false}
          onSelect={setValue}
        />
        <footer>
          <button type="button" className="secondary" onClick={onCancel}>
            취소
          </button>
          <button type="button" disabled={!canReplace} onClick={() => onReplace(value)}>
            교체 후 삭제
          </button>
        </footer>
      </article>
    </dialog>
  )
}
