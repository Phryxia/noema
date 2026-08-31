import type { CSSProperties, ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { MatrixCellPosition } from './computeMatrixNavigation'
import { MatrixCell } from './MatrixCell'
import { MatrixControls } from './MatrixControls'
import type { MatrixHeaderOption } from './types'
import { useMatrixNavigation } from './useMatrixNavigation'
import styles from './MatrixField.module.css'

const cx = classnames.bind(styles)

interface MatrixFieldProps {
  value: string[][]
  header: MatrixHeaderOption
  onChange: (value: string[][]) => void
}

export function MatrixField({ value, header, onChange }: MatrixFieldProps): ReactElement {
  const firstEditableRow = header.isEditable ? 0 : 1
  const gridTemplate = createGridTemplate(value.length, value[0].length, header.isEditable)
  const { rootRef, handleKeyDown } = useMatrixNavigation(value, firstEditableRow)

  function changeCell(position: MatrixCellPosition, cellValue: string): void {
    onChange(applyCellChange(value, position, cellValue))
  }

  return (
    <div className={cx('scroller')}>
      <div ref={rootRef} className={cx('root')} style={gridTemplate}>
        {value.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <MatrixCell
              key={`${rowIndex}-${columnIndex}`}
              value={cell}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              isFixedHeader={!rowIndex && !header.isEditable}
              placeholder={createCellPlaceholder(header, rowIndex, columnIndex)}
              onChange={changeCell}
              onKeyDown={handleKeyDown}
            />
          )),
        )}
        <MatrixControls
          value={value}
          firstEditableRow={firstEditableRow}
          isColumnResizable={header.isEditable}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

function createGridTemplate(
  rowCount: number,
  columnCount: number,
  isColumnResizable: boolean,
): CSSProperties {
  if (!isColumnResizable) {
    return {
      gridTemplateColumns: `min-content 10px repeat(${columnCount}, minmax(0, 1fr))`,
      gridTemplateRows: `min-content 0 repeat(${rowCount}, auto) 10px min-content`,
    }
  }
  return {
    gridTemplateColumns: `min-content 10px repeat(${columnCount}, minmax(0, 1fr)) 10px min-content`,
    gridTemplateRows: `min-content 10px repeat(${rowCount}, auto) 10px min-content`,
  }
}

function applyCellChange(
  value: string[][],
  position: MatrixCellPosition,
  cellValue: string,
): string[][] {
  const sanitized = cellValue.replace(/[\t\r\n]/g, '')
  return value.map((row, rowIndex) =>
    rowIndex === position.row
      ? row.map((cell, columnIndex) => (columnIndex === position.column ? sanitized : cell))
      : row,
  )
}

function createCellPlaceholder(
  header: MatrixHeaderOption,
  rowIndex: number,
  columnIndex: number,
): string | undefined {
  if (rowIndex || !header.isEditable) {
    return undefined
  }
  return header.createPlaceholder(columnIndex)
}
