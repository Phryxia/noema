import type { KeyboardEvent, RefObject } from 'react'
import { useRef } from 'react'
import type { MatrixCellCaret, MatrixCellPosition } from './computeMatrixNavigation'
import { computeMatrixNavigation } from './computeMatrixNavigation'

interface MatrixNavigation {
  rootRef: RefObject<HTMLDivElement | null>
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>, position: MatrixCellPosition) => void
}

export function useMatrixNavigation(
  value: string[][],
  firstEditableRow: number,
): MatrixNavigation {
  const rootRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    position: MatrixCellPosition,
  ): void {
    if (event.nativeEvent.isComposing) {
      return
    }
    const target = computeMatrixNavigation(
      event,
      position,
      event.currentTarget,
      value,
      firstEditableRow,
    )
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
    const columnCount = value[0].length
    const input = inputs?.[(target.row - firstEditableRow) * columnCount + target.column]
    if (!input) {
      return
    }
    input.focus()
    input.setSelectionRange(target.caret, target.caret)
  }

  return { rootRef, handleKeyDown }
}
