import type { FocusEvent, RefObject } from 'react'
import { useRef, useState } from 'react'
import { focusFirstElement } from '../utils/focusFirstElement'

interface SuggestionFocus<T extends HTMLElement> {
  rootRef: RefObject<T | null>
  suggestionRef: RefObject<HTMLElement | null>
  isFocused: boolean
  handleFocus: () => void
  handleBlur: (event: FocusEvent<T>) => void
  focusSuggestion: () => void
  focusField: () => void
  leave: () => void
}

export function useSuggestionFocus<T extends HTMLElement = HTMLDivElement>(
  onFocusChange?: (isFocused: boolean) => void,
): SuggestionFocus<T> {
  const rootRef = useRef<T>(null)
  const suggestionRef = useRef<HTMLElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  function updateFocus(value: boolean): void {
    setIsFocused(value)
    onFocusChange?.(value)
  }

  function handleFocus(): void {
    updateFocus(true)
  }

  function handleBlur(event: FocusEvent<T>): void {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    updateFocus(false)
  }

  function focusSuggestion(): void {
    focusFirstElement(suggestionRef.current)
  }

  function focusField(): void {
    focusFirstElement(rootRef.current, 'input')
  }

  function leave(): void {
    updateFocus(false)
  }

  return {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
    leave,
  }
}
