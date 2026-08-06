import type { FocusEvent, ReactElement } from 'react'
import { useRef, useState } from 'react'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { focusNextElement } from '../../utils/focusNextElement'

interface SubjectWordFieldsProps {
  words: string[]
  requiredCount: number
  onChange: (words: string[]) => void
}

export function SubjectWordFields({
  words,
  requiredCount,
  onChange,
}: SubjectWordFieldsProps): ReactElement {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  function updateWord(index: number, value: string): void {
    onChange(words.map((word, wordIndex) => (wordIndex === index ? value : word)))
  }

  return (
    <div>
      {words.map((word, index) => (
        <SubjectWordField
          key={index}
          word={word}
          placeholder={createPlaceholder(index, requiredCount)}
          isFocused={focusedIndex === index}
          onChange={(value) => updateWord(index, value)}
          onFocusChange={(isFocused) => setFocusedIndex(isFocused ? index : null)}
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
}

function SubjectWordField({
  word,
  placeholder,
  isFocused,
  onChange,
  onFocusChange,
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
