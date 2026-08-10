import type { ReactElement } from 'react'
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
  onSubmit: () => void
}

export function TextWriterField({
  name,
  modes,
  mode,
  value,
  placeholder,
  onModeChange,
  onChange,
  onSubmit,
}: TextWriterFieldProps): ReactElement {
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
  } = useSuggestionFocus()

  return (
    <div>
      {modes.length > 1 && (
        <div className={cx('modes')}>
          <RadioGroup<TextWriterMode>
            role="group"
            name={name}
            value={mode}
            options={modes.map((candidate) => ({
              value: candidate,
              label: candidate,
            }))}
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
          onSubmit={onSubmit}
        />
      )}
    </div>
  )
}
