import type { ReactElement } from 'react'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../../word/useSuggestionFocus'
import { focusNextElement } from '../../utils/focusNextElement'
import classnames from 'classnames/bind'
import styles from './SubjectWordFields.module.css'

const cx = classnames.bind(styles)

interface SubjectWordFieldProps {
  word: string
  placeholder: string
  onChange: (value: string) => void
  onFocusChange: (isFocused: boolean) => void
  onEmptyBackspace?: () => void
  onRandomPick?: () => void
}

export function SubjectWordField({
  word,
  placeholder,
  onChange,
  onFocusChange,
  onEmptyBackspace,
  onRandomPick,
}: SubjectWordFieldProps): ReactElement {
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
    leave,
  } = useSuggestionFocus(onFocusChange)

  function leaveField(): void {
    leave()
    focusNextElement(rootRef.current)
  }

  function selectSuggestion(value: string): void {
    onChange(value)
    leaveField()
  }

  const wordField = (
    <WordField
      value={word}
      isEditable
      placeholder={placeholder}
      onChange={onChange}
      onEnter={leaveField}
      onEmptyBackspace={onEmptyBackspace}
      onArrowDown={focusSuggestion}
    />
  )

  return (
    <div ref={rootRef} onFocus={handleFocus} onBlur={handleBlur}>
      {onRandomPick ? (
        <fieldset role="group" className={cx('group')}>
          {wordField}
          <button
            className={cx('random-button')}
            type="button"
            tabIndex={-1}
            aria-label="랜덤 단어"
            onClick={onRandomPick}
          >
            🎲
          </button>
        </fieldset>
      ) : (
        wordField
      )}
      <WordSuggestion
        ref={suggestionRef}
        keyword={word}
        n={16}
        isVisible={isFocused}
        onSelect={selectSuggestion}
        onExitUp={focusField}
      />
    </div>
  )
}
