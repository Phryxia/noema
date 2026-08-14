import type { KeyboardEvent, ReactElement } from 'react'
import { useRef, useState } from 'react'
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
  onEscape?: () => void
  onEmptyBackspace?: () => void
  onArrowDown?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export function WordField({
  value,
  isEditable,
  placeholder,
  onChange,
  onEnter,
  onEscape,
  onEmptyBackspace,
  onArrowDown,
  onFocus,
  onBlur,
}: WordFieldProps): ReactElement {
  const [scrollLeft, setScrollLeft] = useState(0)
  const isBackspaceFromEmpty = useRef(false)

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing) {
      return
    }
    isBackspaceFromEmpty.current = event.key === 'Backspace' && !value
    if (onArrowDown && event.key === 'ArrowDown') {
      event.preventDefault()
      onArrowDown()
      return
    }
    if (onEscape && event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }
    if (!onEnter || event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    onEnter()
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Backspace' || event.nativeEvent.isComposing) {
      return
    }
    const isReleasedWhileEmpty = isBackspaceFromEmpty.current && !value
    isBackspaceFromEmpty.current = false
    if (!isReleasedWhileEmpty) {
      return
    }
    onEmptyBackspace?.()
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
        onKeyUp={handleKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <WhitespaceEcho value={value} isMultiline={false} scrollLeft={scrollLeft} scrollTop={0} />
    </div>
  )
}
