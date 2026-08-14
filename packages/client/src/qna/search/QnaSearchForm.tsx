import type { ReactElement } from 'react'
import { useState } from 'react'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../../word/useSuggestionFocus'
import classnames from 'classnames/bind'
import styles from './QnaSearchForm.module.css'

const cx = classnames.bind(styles)

interface QnaSearchFormProps {
  onSearch: (query: string) => void
  onCancel: () => void
}

export function QnaSearchForm({ onSearch, onCancel }: QnaSearchFormProps): ReactElement {
  const [input, setInput] = useState('')
  const [isSuggestionMuted, setIsSuggestionMuted] = useState(false)
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
  } = useSuggestionFocus()

  function changeInput(value: string): void {
    setInput(value)
    setIsSuggestionMuted(false)
    if (!value) {
      onCancel()
    }
  }

  function selectSuggestion(word: string): void {
    setInput(word)
    setIsSuggestionMuted(true)
    focusField()
  }

  function submit(): void {
    if (!input) {
      return
    }
    setIsSuggestionMuted(true)
    onSearch(input)
  }

  function cancel(): void {
    setInput('')
    setIsSuggestionMuted(false)
    onCancel()
  }

  return (
    <div ref={rootRef} onFocus={handleFocus} onBlur={handleBlur}>
      <fieldset role="group" className={cx('group')}>
        <WordField
          value={input}
          isEditable
          placeholder="검색어"
          onChange={changeInput}
          onEnter={submit}
          onEscape={cancel}
          onArrowDown={focusSuggestion}
        />
        <button type="button" disabled={!input} onClick={submit}>
          찾기
        </button>
      </fieldset>
      <WordSuggestion
        ref={suggestionRef}
        keyword={input}
        n={16}
        isVisible={isFocused && !isSuggestionMuted}
        isDeletable={false}
        onSelect={selectSuggestion}
        onExitUp={focusField}
      />
    </div>
  )
}
