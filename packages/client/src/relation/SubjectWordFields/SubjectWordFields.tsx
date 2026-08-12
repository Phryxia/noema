import type { Dispatch, ReactElement, SetStateAction } from 'react'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useMutation } from '@tanstack/react-query'
import { SubjectWordField } from './SubjectWordField'
import { getRandomWords } from '../../word/getRandomWords'
import classnames from 'classnames/bind'
import styles from './SubjectWordFields.module.css'

const cx = classnames.bind(styles)

interface SubjectWordFieldsProps {
  words: string[]
  requiredCount: number
  isCountAdjustable?: boolean
  isDirected?: boolean
  hasRandomPick?: boolean
  onChange: Dispatch<SetStateAction<string[]>>
}

export function SubjectWordFields({
  words,
  requiredCount,
  isCountAdjustable,
  isDirected,
  hasRandomPick,
  onChange,
}: SubjectWordFieldsProps): ReactElement {
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

  function createField(index: number, placeholder: string): ReactElement {
    return (
      <SubjectWordField
        key={index}
        word={words[index]}
        placeholder={placeholder}
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
    )
  }

  if (isDirected) {
    return (
      <div ref={rootRef} className={cx('directed')}>
        {createField(0, '단어 1')}
        <span className={cx('edge')} aria-hidden>
          ──
        </span>
        {createField(2, '관계')}
        <span className={cx('edge')} aria-hidden>
          ──▶
        </span>
        {createField(1, '단어 2')}
      </div>
    )
  }

  return (
    <div ref={rootRef}>
      {words.map((_, index) => createField(index, createPlaceholder(index, requiredCount)))}
    </div>
  )
}

function createPlaceholder(index: number, requiredCount: number): string {
  if (index < requiredCount) {
    return `단어 ${index + 1}`
  }
  return `단어 ${index + 1} (optional)`
}
