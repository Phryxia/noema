import { useCallback } from 'react'
import { computeArrivalCaret } from './SentenceCard/arrowNavigation'
import { splitByTripleNewline } from './splitByTripleNewline'
import { useCards } from './useCards'
import type { Cards } from './useCards'

export interface SentenceCards extends Cards<HTMLTextAreaElement> {
  changeCard: (id: number, value: string) => void
}

export function useSentenceCards(getInitialValues: () => string[]): SentenceCards {
  const cards = useCards<HTMLTextAreaElement>(getInitialValues, computeArrivalCaret)
  const { updateCard, splitCard } = cards

  const changeCard = useCallback(
    (id: number, value: string) => {
      const pieces = splitByTripleNewline(value)
      if (!pieces) {
        updateCard(id, value)
        return
      }
      splitCard(id, pieces)
    },
    [updateCard, splitCard],
  )

  return { ...cards, changeCard }
}
