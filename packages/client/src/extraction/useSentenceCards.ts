import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  createSentenceCardList,
  listCards,
  mergeWithPrevious as mergeCardWithPrevious,
  removeCard as removeCardFromList,
  splitByTripleNewline,
  splitCard,
  updateCardValue,
} from './sentenceCardList'
import type { SentenceCard, SentenceCardList } from './sentenceCardList'

export interface SentenceCards {
  cards: SentenceCard[]
  changeCard: (id: number, value: string) => void
  mergeWithPrevious: (id: number) => void
  removeCard: (id: number) => void
  registerTextarea: (id: number, element: HTMLTextAreaElement | null) => void
}

export function useSentenceCards(getInitialValues: () => string[]): SentenceCards {
  const [list, setList] = useState<SentenceCardList>(() =>
    createSentenceCardList(getInitialValues()),
  )
  const listRef = useRef(list)
  listRef.current = list
  const textareasRef = useRef(new Map<number, HTMLTextAreaElement>())

  const registerTextarea = useCallback((id: number, element: HTMLTextAreaElement | null) => {
    if (element) {
      textareasRef.current.set(id, element)
      return
    }
    textareasRef.current.delete(id)
  }, [])

  const focusCard = useCallback((id: number, caret: number) => {
    const element = textareasRef.current.get(id)
    if (!element) {
      return
    }
    element.focus()
    element.setSelectionRange(caret, caret)
  }, [])

  const changeCard = useCallback(
    (id: number, value: string) => {
      const pieces = splitByTripleNewline(value)
      if (!pieces) {
        setList((current) => updateCardValue(current, id, value))
        return
      }
      const { list: next, insertedIds } = splitCard(listRef.current, id, pieces)
      flushSync(() => setList(next))
      if (insertedIds.length) {
        focusCard(insertedIds[0], 0)
      }
    },
    [focusCard],
  )

  const mergeWithPrevious = useCallback(
    (id: number) => {
      const card = listRef.current.nodes.get(id)
      if (!card || card.prevId === null) {
        return
      }
      const previous = listRef.current.nodes.get(card.prevId)
      if (!previous) {
        return
      }
      const junction = previous.value.length
      flushSync(() => setList(mergeCardWithPrevious(listRef.current, id)))
      focusCard(previous.id, junction)
    },
    [focusCard],
  )

  const removeCard = useCallback(
    (id: number) => {
      const card = listRef.current.nodes.get(id)
      if (!card) {
        return
      }
      const previous = card.prevId !== null ? listRef.current.nodes.get(card.prevId) : null
      flushSync(() => setList(removeCardFromList(listRef.current, id)))
      if (previous) {
        focusCard(previous.id, previous.value.length)
        return
      }
      if (card.nextId !== null) {
        focusCard(card.nextId, 0)
      }
    },
    [focusCard],
  )

  return { cards: listCards(list), changeCard, mergeWithPrevious, removeCard, registerTextarea }
}
