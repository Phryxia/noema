import type { KeyboardEvent } from 'react'
import { findCaretNearX, measureCaretLine } from './caretGeometry'
import type { CaretLine } from './caretGeometry'

export type NavigationDirection = 'next' | 'previous'

export interface ArrowNavigation {
  direction: NavigationDirection
  x: number | null
}

type MeasureCaretLine = (textarea: HTMLTextAreaElement, caret: number) => CaretLine

export function computeArrowNavigation(
  event: KeyboardEvent<HTMLTextAreaElement>,
  measure: MeasureCaretLine = measureCaretLine,
): ArrowNavigation | null {
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return null
  }
  const textarea = event.currentTarget
  const { selectionStart: caret, selectionEnd } = textarea
  if (caret !== selectionEnd) {
    return null
  }
  if (event.key === 'ArrowRight') {
    return caret === textarea.value.length ? { direction: 'next', x: null } : null
  }
  if (event.key === 'ArrowLeft') {
    return !caret ? { direction: 'previous', x: null } : null
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
    return null
  }
  const line = measure(textarea, caret)
  if (event.key === 'ArrowDown') {
    return line.isLastLine ? { direction: 'next', x: line.x } : null
  }
  return line.isFirstLine ? { direction: 'previous', x: line.x } : null
}

export function computeArrivalCaret(
  textarea: HTMLTextAreaElement,
  navigation: ArrowNavigation,
): number {
  if (navigation.direction === 'next') {
    return navigation.x === null ? 0 : findCaretNearX(textarea, 'first', navigation.x)
  }
  return navigation.x === null
    ? textarea.value.length
    : findCaretNearX(textarea, 'last', navigation.x)
}
