import type { KeyboardEvent } from 'react'

export function insertTabIfPressed(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
  if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return false
  }
  event.preventDefault()
  document.execCommand('insertText', false, '\t')
  return true
}
