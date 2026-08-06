import type { KeyboardEvent, ReactElement } from 'react'
import { useState } from 'react'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'

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
    <div onKeyDown={preventEnterSubmit}>
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
  return (
    <div>
      <WordField
        value={word}
        isEditable
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
      />
      <WordSuggestion keyword={word} n={16} isVisible={isFocused} onSelect={onChange} />
    </div>
  )
}

function preventEnterSubmit(event: KeyboardEvent<HTMLDivElement>): void {
  if (event.key === 'Enter') {
    event.preventDefault()
  }
}

function createPlaceholder(index: number, requiredCount: number): string {
  if (index < requiredCount) {
    return `단어 ${index + 1}`
  }
  return `단어 ${index + 1} (optional)`
}
