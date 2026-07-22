import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import styles from './MetaFields.module.css'

const cx = classnames.bind(styles)

const DateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'medium',
})

export type MetaValue = string | number | Date | undefined

export interface MetaField {
  label: string
  value: MetaValue
}

interface MetaFieldsProps {
  fields: MetaField[]
}

export function MetaFields({ fields }: MetaFieldsProps): ReactElement {
  return (
    <form className={cx('root')}>
      {fields.map(({ label, value }) => (
        <label key={label} className={cx('field')}>
          {label}
          <input type="text" value={formatMetaValue(value)} readOnly />
        </label>
      ))}
    </form>
  )
}

function formatMetaValue(value: MetaValue): string {
  if (value === undefined) {
    return '없음'
  }
  if (value instanceof Date) {
    return DateTimeFormat.format(value)
  }
  return String(value)
}
