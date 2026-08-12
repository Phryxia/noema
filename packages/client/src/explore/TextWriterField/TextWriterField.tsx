import type { KeyboardEvent, ReactElement } from 'react'
import { SentenceField } from '../../sentence/SentenceField/SentenceField'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../../word/useSuggestionFocus'
import { RadioGroup } from '../../shared/RadioGroup'
import type { TextWriterMode } from '../../writer/types'
import classnames from 'classnames/bind'
import styles from './TextWriterField.module.css'

const cx = classnames.bind(styles)

interface TextWriterFieldProps {
  name: string
  modes: TextWriterMode[]
  mode: TextWriterMode
  value: string
  placeholder?: string
  onModeChange: (mode: TextWriterMode) => void
  onChange: (value: string) => void
  onComplete: () => void
}

export function TextWriterField({
  name,
  modes,
  mode,
  value,
  placeholder,
  onModeChange,
  onChange,
  onComplete,
}: TextWriterFieldProps): ReactElement {
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
    leave,
  } = useSuggestionFocus()

  function handleWordEnter(): void {
    leave()
    onComplete()
  }

  function handleModeKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    onComplete()
  }

  return (
    <div>
      {modes.length > 1 && (
        <div className={cx('modes')} onKeyDown={handleModeKeyDown}>
          <RadioGroup<TextWriterMode>
            role="group"
            name={name}
            value={mode}
            options={modes}
            onChange={onModeChange}
          />
        </div>
      )}
      {mode === '단어' && (
        <div ref={rootRef} onFocus={handleFocus} onBlur={handleBlur}>
          <WordField
            value={value}
            isEditable
            placeholder={placeholder}
            onChange={onChange}
            onEnter={handleWordEnter}
            onArrowDown={focusSuggestion}
          />
          <WordSuggestion
            ref={suggestionRef}
            keyword={value}
            n={16}
            isVisible={isFocused}
            onSelect={onChange}
            onExitUp={focusField}
          />
        </div>
      )}
      {mode === '문장' && (
        <SentenceField
          value={value}
          isEditable
          placeholder={placeholder}
          onChange={onChange}
          onSubmit={onComplete}
        />
      )}
    </div>
  )
}
