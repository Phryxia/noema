import type { KeyboardEvent } from 'react'
import { findCaretNearX, measureCaretLine } from './caretGeometry'
import type { CaretLine } from './caretGeometry'
import {
  checkIsNavigable,
  computeHorizontalCaret,
  computeHorizontalNavigation,
} from '../arrowNavigation'
import type { ArrowNavigation } from '../arrowNavigation'

type MeasureCaretLine = (textarea: HTMLTextAreaElement, caret: number) => CaretLine

export function computeArrowNavigation(
  event: KeyboardEvent<HTMLTextAreaElement>,
  measure: MeasureCaretLine = measureCaretLine,
): ArrowNavigation | null {
  const textarea = event.currentTarget
  const horizontal = computeHorizontalNavigation(event, textarea)
  if (horizontal) {
    return horizontal
  }
  if (!checkIsNavigable(event, textarea)) {
    return null
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
    return null
  }
  const line = measure(textarea, textarea.selectionStart)
  if (event.key === 'ArrowDown') {
    return line.isLastLine ? { direction: 'next', x: line.x } : null
  }
  return line.isFirstLine ? { direction: 'previous', x: line.x } : null
}

export function computeArrivalCaret(
  textarea: HTMLTextAreaElement,
  navigation: ArrowNavigation,
): number {
  if (navigation.x === null) {
    return computeHorizontalCaret(textarea, navigation)
  }
  if (navigation.direction === 'next') {
    return findCaretNearX(textarea, 'first', navigation.x)
  }
  return findCaretNearX(textarea, 'last', navigation.x)
}
