import { FOCUSABLE_SELECTOR } from './consts'

export function focusFirstElement(container: HTMLElement | null): void {
  if (!container) {
    return
  }

  container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()
}
