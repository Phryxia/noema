import { useCallback, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { ArrowNavigation } from './arrowNavigation'
import {
  createCardList,
  listCards,
  mergeWithPrevious as mergeCardWithPrevious,
  removeCard as removeCardFromList,
  splitCard as splitCardInList,
  updateCardValue,
} from './cardList'
import type { Card, CardList } from './cardList'

export interface FocusableElement {
  focus: () => void
  setSelectionRange: (start: number, end: number) => void
}

export interface Cards<TElement> {
  cards: Card[]
  updateCard: (id: number, value: string) => void
  splitCard: (id: number, pieces: string[]) => void
  mergeWithPrevious: (id: number) => void
  removeCard: (id: number) => void
  focusAdjacentCard: (id: number, navigation: ArrowNavigation) => void
  registerElement: (id: number, element: TElement | null) => void
}

export function useCards<TElement extends FocusableElement>(
  getInitialValues: () => string[],
  computeArrivalCaret: (element: TElement, navigation: ArrowNavigation) => number,
): Cards<TElement> {
  const [list, setList] = useState<CardList>(() => createCardList(getInitialValues()))
  const listRef = useRef(list)
  listRef.current = list
  const elementsRef = useRef(new Map<number, TElement>())

  const registerElement = useCallback((id: number, element: TElement | null) => {
    if (element) {
      elementsRef.current.set(id, element)
      return
    }
    elementsRef.current.delete(id)
  }, [])

  const focusCard = useCallback((id: number, caret: number) => {
    const element = elementsRef.current.get(id)
    if (!element) {
      return
    }
    element.focus()
    element.setSelectionRange(caret, caret)
  }, [])

  const updateCard = useCallback((id: number, value: string) => {
    setList((current) => updateCardValue(current, id, value))
  }, [])

  const splitCard = useCallback(
    (id: number, pieces: string[]) => {
      const { list: next, insertedIds } = splitCardInList(listRef.current, id, pieces)
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

  const focusAdjacentCard = useCallback(
    (id: number, navigation: ArrowNavigation) => {
      const card = listRef.current.nodes.get(id)
      const targetId = navigation.direction === 'next' ? card?.nextId : card?.prevId
      if (targetId === null || targetId === undefined) {
        return
      }
      const element = elementsRef.current.get(targetId)
      if (!element) {
        return
      }
      focusCard(targetId, computeArrivalCaret(element, navigation))
    },
    [focusCard, computeArrivalCaret],
  )

  const cards = useMemo(() => listCards(list), [list])

  return {
    cards,
    updateCard,
    splitCard,
    mergeWithPrevious,
    removeCard,
    focusAdjacentCard,
    registerElement,
  }
}
