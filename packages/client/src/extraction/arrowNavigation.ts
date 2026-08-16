import type { KeyboardEvent } from 'react'

export type NavigationDirection = 'next' | 'previous'

export interface ArrowNavigation {
  direction: NavigationDirection
  x: number | null
}

export interface CaretElement {
  value: string
  selectionStart: number | null
  selectionEnd: number | null
}

export function computeHorizontalNavigation(
  event: KeyboardEvent<HTMLElement>,
  element: CaretElement,
): ArrowNavigation | null {
  if (!checkIsNavigable(event, element)) {
    return null
  }
  const caret = element.selectionStart ?? 0
  if (event.key === 'ArrowRight') {
    return caret === element.value.length ? { direction: 'next', x: null } : null
  }
  if (event.key === 'ArrowLeft') {
    return !caret ? { direction: 'previous', x: null } : null
  }
  return null
}

export function checkIsNavigable(
  event: KeyboardEvent<HTMLElement>,
  element: CaretElement,
): boolean {
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return false
  }
  return element.selectionStart === element.selectionEnd
}

export function computeHorizontalCaret(
  element: CaretElement,
  navigation: ArrowNavigation,
): number {
  return navigation.direction === 'next' ? 0 : element.value.length
}
