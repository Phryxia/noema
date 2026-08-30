import type { MouseEvent } from 'react'

export function keepFieldFocus(event: MouseEvent): void {
  event.preventDefault()
}
