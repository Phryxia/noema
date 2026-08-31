import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { addColumn, addRow, removeColumnAt, removeRowAt } from './resizeMatrix'
import styles from './MatrixField.module.css'

const cx = classnames.bind(styles)

interface MatrixControlsProps {
  value: string[][]
  firstEditableRow: number
  isColumnResizable: boolean
  onChange: (value: string[][]) => void
}

export function MatrixControls({
  value,
  firstEditableRow,
  isColumnResizable,
  onChange,
}: MatrixControlsProps): ReactElement {
  const rowCount = value.length
  const columnCount = value[0].length
  return (
    <>
      {isColumnResizable && <MatrixColumnControls value={value} onChange={onChange} />}
      {value.slice(firstEditableRow).map((_, index) => (
        <button
          key={`row-${index}`}
          type="button"
          className={cx('control', 'secondary', 'outline')}
          aria-label={`${index + 1}번째 행 삭제`}
          disabled={rowCount <= firstEditableRow + 1}
          style={{ gridRow: index + firstEditableRow + 3, gridColumn: 1 }}
          onClick={() => onChange(removeRowAt(value, index + firstEditableRow))}
        >
          -
        </button>
      ))}
      <button
        type="button"
        className={cx('control', 'secondary', 'outline')}
        aria-label="행 추가"
        style={{ gridRow: rowCount + 4, gridColumn: `3 / ${columnCount + 3}` }}
        onClick={() => onChange(addRow(value))}
      >
        +
      </button>
    </>
  )
}

interface MatrixColumnControlsProps {
  value: string[][]
  onChange: (value: string[][]) => void
}

function MatrixColumnControls({ value, onChange }: MatrixColumnControlsProps): ReactElement {
  const rowCount = value.length
  const columnCount = value[0].length
  return (
    <>
      {value[0].map((_, columnIndex) => (
        <button
          key={`column-${columnIndex}`}
          type="button"
          className={cx('control', 'secondary', 'outline')}
          aria-label={`${columnIndex + 1}번째 열 삭제`}
          disabled={columnCount === 1}
          style={{ gridRow: 1, gridColumn: columnIndex + 3 }}
          onClick={() => onChange(removeColumnAt(value, columnIndex))}
        >
          -
        </button>
      ))}
      <button
        type="button"
        className={cx('control', 'secondary', 'outline')}
        aria-label="열 추가"
        style={{ gridRow: `3 / ${rowCount + 3}`, gridColumn: columnCount + 4 }}
        onClick={() => onChange(addColumn(value))}
      >
        +
      </button>
    </>
  )
}
