import type { TernaryWords, WordRelation, WordSlot } from './types'

export function readWordSlots(relation: WordRelation, slots: WordSlot[]): number[] {
  const words = relation as Partial<TernaryWords>
  return slots.flatMap((slot) => {
    const wordId = words[slot]
    return wordId === undefined ? [] : [wordId]
  })
}
