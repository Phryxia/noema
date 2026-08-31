import type { KeyboardEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { MatrixCellPosition } from './computeMatrixNavigation'
import { WordField } from '../../../word/WordField/WordField'
import styles from './MatrixField.module.css'

const cx = classnames.bind(styles)

interface MatrixCellProps {
  value: string
  rowIndex: number
  columnIndex: number
  isFixedHeader: boolean
  placeholder?: string
  onChange: (position: MatrixCellPosition, cellValue: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>, position: MatrixCellPosition) => void
}

export function MatrixCell({
  value,
  rowIndex,
  columnIndex,
  isFixedHeader,
  placeholder,
  onChange,
  onKeyDown,
}: MatrixCellProps): ReactElement {
  const position = { row: rowIndex, column: columnIndex }
  return (
    <div
      className={cx('cell', { header: !rowIndex })}
      style={{ gridRow: rowIndex + 3, gridColumn: columnIndex + 3 }}
    >
      {isFixedHeader ? (
        <strong className={cx('headerLabel')}>{value}</strong>
      ) : (
        <WordField
          value={value}
          isEditable
          placeholder={placeholder}
          onChange={(cellValue) => onChange(position, cellValue)}
          onKeyDown={(event) => onKeyDown(event, position)}
        />
      )}
    </div>
  )
}
