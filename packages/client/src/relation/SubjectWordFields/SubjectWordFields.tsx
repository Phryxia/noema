import type { Dispatch, FocusEvent, ReactElement, SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { focusNextElement } from '../../utils/focusNextElement'

interface SubjectWordFieldsProps {
  words: string[]
  requiredCount: number
  isCountAdjustable?: boolean
  onChange: Dispatch<SetStateAction<string[]>>
}

export function SubjectWordFields({
  words,
  requiredCount,
  isCountAdjustable,
  onChange,
}: SubjectWordFieldsProps): ReactElement {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  function updateWord(index: number, value: string): void {
    onChange(words.map((word, wordIndex) => (wordIndex === index ? value : word)))
  }

  function handleFocusChange(index: number, isFocused: boolean): void {
    setFocusedIndex(isFocused ? index : null)
    if (isFocused) {
      return
    }
    appendWordIfNeeded(index)
  }

  function appendWordIfNeeded(index: number): void {
    if (!isCountAdjustable || index !== words.length - 1 || !words[index]) {
      return
    }
    flushSync(() => onChange((currentWords) => currentWords.concat('')))
  }

  function removeWord(index: number): void {
    const inputs = rootRef.current?.querySelectorAll('input')
    const previousInput = inputs?.[index - 1]
    if (previousInput) {
      previousInput.focus()
      previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length)
    }
    onChange((currentWords) => currentWords.filter((_, wordIndex) => wordIndex !== index))
  }

  return (
    <div ref={rootRef}>
      {words.map((word, index) => (
        <SubjectWordField
          key={index}
          word={word}
          placeholder={createPlaceholder(index, requiredCount)}
          isFocused={focusedIndex === index}
          onChange={(value) => updateWord(index, value)}
          onFocusChange={(isFocused) => handleFocusChange(index, isFocused)}
          onEmptyBackspace={
            isCountAdjustable && index > 0 ? (): void => removeWord(index) : undefined
          }
        />
      ))}
    </div>
  )
}

interface SubjectWordFieldProps {
  word: string
  placeholder: string
  isFocused: boolean
  onChange: (value: string) => void
  onFocusChange: (isFocused: boolean) => void
  onEmptyBackspace?: () => void
}

function SubjectWordField({
  word,
  placeholder,
  isFocused,
  onChange,
  onFocusChange,
  onEmptyBackspace,
}: SubjectWordFieldProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)

  function leaveField(): void {
    onFocusChange(false)
    focusNextElement(containerRef.current)
  }

  function selectSuggestion(value: string): void {
    onChange(value)
    leaveField()
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    onFocusChange(false)
  }

  return (
    <div ref={containerRef} onFocus={() => onFocusChange(true)} onBlur={handleBlur}>
      <WordField
        value={word}
        isEditable
        placeholder={placeholder}
        onChange={onChange}
        onEnter={leaveField}
        onEmptyBackspace={onEmptyBackspace}
      />
      <WordSuggestion keyword={word} n={16} isVisible={isFocused} onSelect={selectSuggestion} />
    </div>
  )
}

function createPlaceholder(index: number, requiredCount: number): string {
  if (index < requiredCount) {
    return `단어 ${index + 1}`
  }
  return `단어 ${index + 1} (optional)`
}
