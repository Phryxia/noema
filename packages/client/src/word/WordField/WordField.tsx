import type { ReactElement } from 'react'
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
}

export function WordField({
  value,
  isEditable,
  placeholder,
  onChange,
}: WordFieldProps): ReactElement {
  const [scrollLeft, setScrollLeft] = useState(0)

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
      />
      <WhitespaceEcho value={value} isMultiline={false} scrollLeft={scrollLeft} scrollTop={0} />
    </div>
  )
}
