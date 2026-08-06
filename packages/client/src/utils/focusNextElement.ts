import { FOCUSABLE_SELECTOR } from './consts'

export function focusNextElement(container: HTMLElement | null): void {
  if (!container) {
    return
  }

  const candidates = container.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  for (const candidate of candidates) {
    if (container.contains(candidate)) {
      continue
    }
    if (container.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) {
      candidate.focus()
      return
    }
  }
}
