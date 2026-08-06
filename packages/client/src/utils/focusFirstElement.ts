import { FOCUSABLE_SELECTOR } from './consts'

export function focusFirstElement(
  container: HTMLElement | null,
  selector: string = FOCUSABLE_SELECTOR,
): void {
  if (!container) {
    return
  }

  container.querySelector<HTMLElement>(selector)?.focus()
}
