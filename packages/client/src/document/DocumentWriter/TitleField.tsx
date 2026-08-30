import type { KeyboardEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import { WordField } from '../../word/WordField/WordField'
import styles from './TitleField.module.css'

const cx = classnames.bind(styles)

const LINE_BREAK_PATTERN = /[\t\r\n]/g

interface TitleFieldProps {
  value: string
  isEditable: boolean
  onChange: (title: string) => void
  onSubmit?: () => void
}

export function TitleField({
  value,
  isEditable,
  onChange,
  onSubmit,
}: TitleFieldProps): ReactElement {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    if (event.ctrlKey && !event.nativeEvent.isComposing) {
      onSubmit?.()
    }
  }

  return (
    <label className={cx('root')}>
      제목
      <div className={cx('field')}>
        <WordField
          value={value}
          isEditable={isEditable}
          placeholder="제목"
          onChange={(next) => onChange(next.replace(LINE_BREAK_PATTERN, ''))}
          onKeyDown={handleKeyDown}
        />
      </div>
    </label>
  )
}
