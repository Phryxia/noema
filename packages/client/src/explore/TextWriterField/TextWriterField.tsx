import type { ReactElement } from 'react'
import { SentenceField } from '../../sentence/SentenceField/SentenceField'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { WriterModeSelector } from '../../writer/WriterModeSelector/WriterModeSelector'
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
  return (
    <div>
      {modes.length > 1 && (
        <div className={cx('modes')}>
          <WriterModeSelector name={name} modes={modes} mode={mode} onChange={onModeChange} />
        </div>
      )}
      {mode === '단어' && (
        <>
          <WordField value={value} isEditable placeholder={placeholder} onChange={onChange} />
          <WordSuggestion keyword={value} n={16} />
        </>
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
