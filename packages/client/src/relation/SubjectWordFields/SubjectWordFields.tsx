import type { Dispatch, FocusEvent, ReactElement, SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useMutation } from '@tanstack/react-query'
import { WordField } from '../../word/WordField/WordField'
import { WordSuggestion } from '../../word/WordSuggestion/WordSuggestion'
import { getRandomWords } from '../../word/getRandomWords'
import { focusNextElement } from '../../utils/focusNextElement'
import classnames from 'classnames/bind'
import styles from './SubjectWordFields.module.css'

const cx = classnames.bind(styles)

interface SubjectWordFieldsProps {
  words: string[]
  requiredCount: number
  isCountAdjustable?: boolean
  hasRandomPick?: boolean
  onChange: Dispatch<SetStateAction<string[]>>
}

export function SubjectWordFields({
  words,
  requiredCount,
  isCountAdjustable,
  hasRandomPick,
  onChange,
}: SubjectWordFieldsProps): ReactElement {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const { mutate: rollRandomWord, isPending: isRolling } = useMutation({
    mutationFn: async (index: number) => {
      const candidates = await getRandomWords(words.length)
      const picked = candidates.find((lexis) => !words.includes(lexis.value))
      if (picked) {
        updateWord(index, picked.value)
      }
    },
  })

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
          onRandomPick={
            hasRandomPick
              ? (): void => {
                  if (!isRolling) {
                    rollRandomWord(index)
                  }
                }
              : undefined
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
  onRandomPick?: () => void
}

function SubjectWordField({
  word,
  placeholder,
  isFocused,
  onChange,
  onFocusChange,
  onEmptyBackspace,
  onRandomPick,
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

  const wordField = (
    <WordField
      value={word}
      isEditable
      placeholder={placeholder}
      onChange={onChange}
      onEnter={leaveField}
      onEmptyBackspace={onEmptyBackspace}
    />
  )

  return (
    <div ref={containerRef} onFocus={() => onFocusChange(true)} onBlur={handleBlur}>
      {onRandomPick ? (
        <fieldset role="group" className={cx('group')}>
          {wordField}
          <button
            className={cx('random-button')}
            type="button"
            tabIndex={-1}
            aria-label="랜덤 단어"
            onClick={onRandomPick}
          >
            🎲
          </button>
        </fieldset>
      ) : (
        wordField
      )}
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
