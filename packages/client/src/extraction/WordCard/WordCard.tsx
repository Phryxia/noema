import type { KeyboardEvent, ReactElement } from 'react'
import { memo, useRef } from 'react'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../../word/useSuggestionFocus'
import { computeHorizontalNavigation } from '../arrowNavigation'
import type { ArrowNavigation } from '../arrowNavigation'
import { computePendingBackspace } from '../computePendingBackspace'
import type { PendingBackspace } from '../computePendingBackspace'

interface WordCardProps {
  id: number
  value: string
  hasSuggestion?: boolean
  onChange: (id: number, value: string) => void
  onSplit: (id: number, pieces: string[]) => void
  onMergeWithPrevious: (id: number) => void
  onRemove: (id: number) => void
  onNavigate: (id: number, navigation: ArrowNavigation) => void
  onRegister: (id: number, element: HTMLInputElement | null) => void
}

export const WordCard = memo(function WordCard({
  id,
  value,
  hasSuggestion,
  onChange,
  onSplit,
  onMergeWithPrevious,
  onRemove,
  onNavigate,
  onRegister,
}: WordCardProps): ReactElement {
  const pendingBackspace = useRef<PendingBackspace>(null)
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
  } = useSuggestionFocus()

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing) {
      return
    }
    const input = event.currentTarget
    pendingBackspace.current = computePendingBackspace(event, input, value)
    if (event.key === 'Enter') {
      event.preventDefault()
      onSplit(id, splitAtSelection(input, value))
      return
    }
    const navigation = computeHorizontalNavigation(event, input)
    if (!navigation) {
      return
    }
    event.preventDefault()
    onNavigate(id, navigation)
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Backspace' || event.nativeEvent.isComposing) {
      return
    }
    const pending = pendingBackspace.current
    pendingBackspace.current = null
    if (pending === 'merge') {
      onMergeWithPrevious(id)
      return
    }
    if (pending === 'remove') {
      onRemove(id)
    }
  }

  function selectSuggestion(word: string): void {
    focusField()
    onChange(id, word)
  }

  const wordField = (
    <WordField
      value={value}
      isEditable
      isInline
      inputRef={(element) => onRegister(id, element)}
      onChange={(next) => onChange(id, next)}
      onArrowDown={hasSuggestion ? focusSuggestion : undefined}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    />
  )

  if (!hasSuggestion) {
    return wordField
  }

  return (
    <div ref={rootRef} onFocus={handleFocus} onBlur={handleBlur}>
      {wordField}
      <WordSuggestion
        ref={suggestionRef}
        keyword={isFocused ? value : ''}
        n={8}
        isVisible={isFocused}
        isDeletable={false}
        onSelect={selectSuggestion}
        onExitUp={focusField}
      />
    </div>
  )
})

function splitAtSelection(input: HTMLInputElement, value: string): string[] {
  const start = input.selectionStart ?? value.length
  const end = input.selectionEnd ?? start
  return [value.slice(0, start), value.slice(end)]
}
