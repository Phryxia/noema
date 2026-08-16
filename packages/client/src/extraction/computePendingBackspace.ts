import type { KeyboardEvent } from 'react'
import type { CaretElement } from './arrowNavigation'

export type PendingBackspace = 'merge' | 'remove' | null

export function computePendingBackspace(
  event: KeyboardEvent<HTMLElement>,
  element: CaretElement,
  value: string,
): PendingBackspace {
  if (event.key !== 'Backspace') {
    return null
  }
  if (!value) {
    return 'remove'
  }
  if (!element.selectionStart && !element.selectionEnd) {
    return 'merge'
  }
  return null
}
