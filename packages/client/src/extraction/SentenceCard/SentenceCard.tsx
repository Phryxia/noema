import type { KeyboardEvent, ReactElement } from 'react'
import { memo, useRef } from 'react'
import { SentenceField } from '../../sentence/SentenceField/SentenceField'
import { computeArrowNavigation } from './arrowNavigation'
import type { ArrowNavigation } from './arrowNavigation'

const CARD_ROWS = 1

type PendingBackspace = 'merge' | 'remove' | null

interface SentenceCardProps {
  id: number
  value: string
  onChange: (id: number, value: string) => void
  onMergeWithPrevious: (id: number) => void
  onRemove: (id: number) => void
  onNavigate: (id: number, navigation: ArrowNavigation) => void
  onRegister: (id: number, element: HTMLTextAreaElement | null) => void
}

export const SentenceCard = memo(function SentenceCard({
  id,
  value,
  onChange,
  onMergeWithPrevious,
  onRemove,
  onNavigate,
  onRegister,
}: SentenceCardProps): ReactElement {
  const pendingBackspace = useRef<PendingBackspace>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.nativeEvent.isComposing) {
      return
    }
    pendingBackspace.current = computePendingBackspace(event, value)
    const navigation = computeArrowNavigation(event)
    if (!navigation) {
      return
    }
    event.preventDefault()
    onNavigate(id, navigation)
  }

  function handleKeyUp(event: KeyboardEvent<HTMLTextAreaElement>): void {
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

  return (
    <SentenceField
      value={value}
      isEditable
      rows={CARD_ROWS}
      textareaRef={(element) => onRegister(id, element)}
      onChange={(next) => onChange(id, next)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    />
  )
})

function computePendingBackspace(
  event: KeyboardEvent<HTMLTextAreaElement>,
  value: string,
): PendingBackspace {
  if (event.key !== 'Backspace') {
    return null
  }
  if (!value) {
    return 'remove'
  }
  const { selectionStart, selectionEnd } = event.currentTarget
  if (!selectionStart && !selectionEnd) {
    return 'merge'
  }
  return null
}
