import type { KeyboardEvent, ReactElement } from 'react'
import { useState } from 'react'
import { WhitespaceEcho } from '../../writer/WhitespaceEcho/WhitespaceEcho'
import classnames from 'classnames/bind'
import styles from './WordField.module.css'

const cx = classnames.bind(styles)

interface WordFieldProps {
  value: string
  isEditable: boolean
  placeholder?: string
  onChange: (value: string) => void
  onEnter?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export function WordField({
  value,
  isEditable,
  placeholder,
  onChange,
  onEnter,
  onFocus,
  onBlur,
}: WordFieldProps): ReactElement {
  const [scrollLeft, setScrollLeft] = useState(0)

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (!onEnter || event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    onEnter()
  }

  return (
    <div className={cx('inputWrapper')}>
      <input
        className={cx('input')}
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly={!isEditable}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <WhitespaceEcho value={value} isMultiline={false} scrollLeft={scrollLeft} scrollTop={0} />
    </div>
  )
}
