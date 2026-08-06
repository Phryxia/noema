const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

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
