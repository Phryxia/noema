import type { KeyboardEvent, ReactElement } from 'react'
import { useRef } from 'react'
import classnames from 'classnames/bind'
import type { MatrixCellCaret, MatrixCellPosition } from './computeMatrixNavigation'
import { computeMatrixNavigation } from './computeMatrixNavigation'
import { addColumn, addRow, removeColumnAt, removeRowAt } from './resizeMatrix'
import { WordField } from '../../../word/WordField/WordField'
import styles from './MatrixField.module.css'

const cx = classnames.bind(styles)

interface MatrixFieldProps {
  value: string[][]
  createHeaderPlaceholder: (columnIndex: number) => string
  onChange: (value: string[][]) => void
}

export function MatrixField({
  value,
  createHeaderPlaceholder,
  onChange,
}: MatrixFieldProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const rowCount = value.length
  const columnCount = value[0].length

  function changeCell(position: MatrixCellPosition, cellValue: string): void {
    const sanitized = cellValue.replace(/[\t\r\n]/g, '')
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === position.row
          ? row.map((cell, columnIndex) => (columnIndex === position.column ? sanitized : cell))
          : row,
      ),
    )
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    position: MatrixCellPosition,
  ): void {
    if (event.nativeEvent.isComposing) {
      return
    }
    const target = computeMatrixNavigation(event, position, event.currentTarget, value)
    if (target) {
      event.preventDefault()
      focusCell(target)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  function focusCell(target: MatrixCellCaret): void {
    const inputs = rootRef.current?.querySelectorAll('input')
    const input = inputs?.[target.row * columnCount + target.column]
    if (!input) {
      return
    }
    input.focus()
    input.setSelectionRange(target.caret, target.caret)
  }

  return (
    <div className={cx('scroller')}>
      <div
        ref={rootRef}
        className={cx('root')}
        style={{
          gridTemplateColumns: `min-content 10px repeat(${columnCount}, minmax(0, 1fr)) 10px min-content`,
          gridTemplateRows: `min-content 10px repeat(${rowCount}, auto) 10px min-content`,
        }}
      >
        {value.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <MatrixCell
              key={`${rowIndex}-${columnIndex}`}
              value={cell}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              placeholder={!rowIndex ? createHeaderPlaceholder(columnIndex) : undefined}
              onChange={changeCell}
              onKeyDown={handleKeyDown}
            />
          )),
        )}
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
        {value.map((_, rowIndex) => (
          <button
            key={`row-${rowIndex}`}
            type="button"
            className={cx('control', 'secondary', 'outline')}
            aria-label={`${rowIndex + 1}번째 행 삭제`}
            disabled={rowCount === 1}
            style={{ gridRow: rowIndex + 3, gridColumn: 1 }}
            onClick={() => onChange(removeRowAt(value, rowIndex))}
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
        <button
          type="button"
          className={cx('control', 'secondary', 'outline')}
          aria-label="행 추가"
          style={{ gridRow: rowCount + 4, gridColumn: `3 / ${columnCount + 3}` }}
          onClick={() => onChange(addRow(value))}
        >
          +
        </button>
      </div>
    </div>
  )
}

interface MatrixCellProps {
  value: string
  rowIndex: number
  columnIndex: number
  placeholder?: string
  onChange: (position: MatrixCellPosition, cellValue: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>, position: MatrixCellPosition) => void
}

function MatrixCell({
  value,
  rowIndex,
  columnIndex,
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
      <WordField
        value={value}
        isEditable
        placeholder={placeholder}
        onChange={(cellValue) => onChange(position, cellValue)}
        onKeyDown={(event) => onKeyDown(event, position)}
      />
    </div>
  )
}
