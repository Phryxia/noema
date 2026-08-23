import { QuestionSpecs } from './questionSpecs'
import type { RelationQuestion, TernaryWords, WordRelationType, WordSlot } from './types'

export function checkIsTernaryRelationType(type: WordRelationType): boolean {
  return type === 'TernaryComposition' || type === 'NamedAssociation'
}

export function getTernaryWordIds(
  question: RelationQuestion,
  answerWordIds: number[],
): TernaryWords | null {
  if (!checkIsTernaryRelationType(question.type)) {
    return null
  }
  const { given, answer } = QuestionSpecs[question.type]
  const words: Partial<TernaryWords> = {}
  if (Array.isArray(given)) {
    fillSlots(words, given, question.wordIds)
  }
  if (answer.kind === 'words') {
    fillSlots(words, answer.slots, answerWordIds)
  }
  if (
    words.word1Id === undefined ||
    words.word2Id === undefined ||
    words.word3Id === undefined
  ) {
    return null
  }
  return { word1Id: words.word1Id, word2Id: words.word2Id, word3Id: words.word3Id }
}

function fillSlots(words: Partial<TernaryWords>, slots: WordSlot[], wordIds: number[]): void {
  slots.forEach((slot, index) => {
    const wordId = wordIds[index]
    if (wordId !== undefined) {
      words[slot] = wordId
    }
  })
}
