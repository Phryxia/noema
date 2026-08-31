export interface MatrixKeyInput {
  key: string
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
}

export interface MatrixCellPosition {
  row: number
  column: number
}

export interface MatrixCellSelection {
  selectionStart: number | null
  selectionEnd: number | null
}

export interface MatrixCellCaret extends MatrixCellPosition {
  caret: number
}

export function computeMatrixNavigation(
  input: MatrixKeyInput,
  position: MatrixCellPosition,
  selection: MatrixCellSelection,
  matrix: string[][],
  firstRow: number = 0,
): MatrixCellCaret | null {
  if (input.shiftKey || input.ctrlKey || input.altKey || input.metaKey) {
    return null
  }
  if (input.key === 'Tab') {
    return moveForward(position, matrix)
  }
  if (selection.selectionStart !== selection.selectionEnd) {
    return null
  }
  const caret = selection.selectionStart ?? 0
  switch (input.key) {
    case 'ArrowRight':
      return caret === matrix[position.row][position.column].length
        ? moveForward(position, matrix)
        : null
    case 'ArrowLeft':
      return !caret ? moveBackward(position, matrix, firstRow) : null
    case 'ArrowUp':
      return moveVertical(position, matrix, -1, caret, firstRow)
    case 'ArrowDown':
    case 'Enter':
      return moveVertical(position, matrix, 1, caret, firstRow)
    default:
      return null
  }
}

function moveForward(position: MatrixCellPosition, matrix: string[][]): MatrixCellCaret | null {
  if (position.column < matrix[position.row].length - 1) {
    return { row: position.row, column: position.column + 1, caret: 0 }
  }
  if (position.row < matrix.length - 1) {
    return { row: position.row + 1, column: 0, caret: 0 }
  }
  return null
}

function moveBackward(
  position: MatrixCellPosition,
  matrix: string[][],
  firstRow: number,
): MatrixCellCaret | null {
  if (position.column > 0) {
    const column = position.column - 1
    return { row: position.row, column, caret: matrix[position.row][column].length }
  }
  if (position.row > firstRow) {
    const row = position.row - 1
    const column = matrix[row].length - 1
    return { row, column, caret: matrix[row][column].length }
  }
  return null
}

function moveVertical(
  position: MatrixCellPosition,
  matrix: string[][],
  delta: number,
  caret: number,
  firstRow: number,
): MatrixCellCaret | null {
  const row = position.row + delta
  if (row < firstRow || row >= matrix.length) {
    return null
  }
  return {
    row,
    column: position.column,
    caret: Math.min(caret, matrix[row][position.column].length),
  }
}
