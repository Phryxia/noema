import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { Choice } from './ChoiceGroup'
import { focusNextElement } from '../../utils/focusNextElement'

interface ChoiceShortcutParams<TValue> {
  isEnabled: boolean
  rootRef: RefObject<HTMLDivElement | null>
  choices: Choice<TValue>[]
  hasSelection: boolean
  onSelect: (value: TValue) => void
}

export function useChoiceShortcut<TValue>({
  isEnabled,
  rootRef,
  choices,
  hasSelection,
  onSelect,
}: ChoiceShortcutParams<TValue>): void {
  useEffect(() => {
    if (!isEnabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
        return
      }
      if (checkIsTyping(event.target)) {
        return
      }
      if (event.key === 'Enter') {
        if (!hasSelection || !checkIsInsideOrBody(event.target, rootRef.current)) {
          return
        }
        event.preventDefault()
        focusNextElement(rootRef.current)
        return
      }
      const index = getChoiceIndex(event.key, choices.length)
      if (index === null) {
        return
      }
      event.preventDefault()
      onSelect(choices[index].value)
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => window.removeEventListener('keydown', handleKeyDown)
  })
}

function checkIsTyping(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement) {
    return !NonTypingInputTypes.includes(target.type)
  }
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true
  }
  return target instanceof HTMLElement && target.isContentEditable
}

const NonTypingInputTypes = ['button', 'checkbox', 'color', 'radio', 'range', 'reset', 'submit']

function checkIsInsideOrBody(target: EventTarget | null, root: HTMLElement | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return true
  }
  return target === target.ownerDocument.body || !!root?.contains(target)
}

function getChoiceIndex(key: string, count: number): number | null {
  if (!/^[1-9]$/.test(key)) {
    return null
  }
  const index = Number(key) - 1
  if (index >= count) {
    return null
  }
  return index
}
