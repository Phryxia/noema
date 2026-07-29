import type { KeyboardEvent, ReactElement } from 'react'
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
  onChange: (value: string) => void
  onSubmit: () => void
}

export function SentenceField({
  value,
  isEditable,
  placeholder,
  onChange,
  onSubmit,
}: SentenceFieldProps): ReactElement {
  const [scrollTop, setScrollTop] = useState(0)

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (isEditable && insertTabIfPressed(event)) {
      return
    }
    if (event.key !== 'Enter' || !event.ctrlKey) {
      return
    }
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className={cx('textareaWrapper')}>
      <textarea
        className={cx('textarea')}
        value={value}
        placeholder={placeholder}
        readOnly={!isEditable}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        onKeyDown={handleKeyDown}
      />
      <WhitespaceEcho value={value} isMultiline scrollLeft={0} scrollTop={scrollTop} />
    </div>
  )
}
