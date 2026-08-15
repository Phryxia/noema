import type { FocusEvent, KeyboardEvent, ReactElement, Ref } from 'react'
import { useState } from 'react'
import { WhitespaceEcho } from '../../writer/WhitespaceEcho/WhitespaceEcho'
import { insertTabIfPressed } from '../../writer/insertTabIfPressed'
import classnames from 'classnames/bind'
import styles from './SentenceField.module.css'

const cx = classnames.bind(styles)

interface SentenceFieldProps {
  value: string
  isEditable: boolean
  placeholder?: string
  rows?: number
  textareaRef?: Ref<HTMLTextAreaElement>
  onChange: (value: string) => void
  onSubmit?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void
}

export function SentenceField({
  value,
  isEditable,
  placeholder,
  rows,
  textareaRef,
  onChange,
  onSubmit,
  onKeyDown,
  onKeyUp,
  onFocus,
}: SentenceFieldProps): ReactElement {
  const [scrollTop, setScrollTop] = useState(0)

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (isEditable && insertTabIfPressed(event)) {
      return
    }
    onKeyDown?.(event)
    if (!onSubmit || event.key !== 'Enter' || !event.ctrlKey) {
      return
    }
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className={cx('textareaWrapper')}>
      <textarea
        ref={textareaRef}
        className={cx('textarea', { compact: rows !== undefined })}
        value={value}
        placeholder={placeholder}
        rows={rows}
        readOnly={!isEditable}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
      />
      <WhitespaceEcho value={value} isMultiline scrollLeft={0} scrollTop={scrollTop} />
    </div>
  )
}
