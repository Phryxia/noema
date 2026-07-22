import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import styles from './SourceField.module.css'

const cx = classnames.bind(styles)

interface SourceFieldProps {
  value: string
  isEditable: boolean
  onChange: (source: string) => void
}

export function SourceField({ value, isEditable, onChange }: SourceFieldProps): ReactElement {
  return (
    <label className={cx('root')}>
      출처
      <input
        className={cx('source')}
        type="text"
        placeholder="출처"
        value={value}
        readOnly={!isEditable}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
