import type { SearchField, SearchTarget } from './types'

const FieldOrder: SearchField[] = ['word', 'word1', 'word2', 'word3', 'answer', 'comment']

export function getSearchTargetRank(target: SearchTarget): number {
  return FieldOrder.indexOf(target.field) * 2 + (target.textType === 'sentence' ? 1 : 0)
}

export function comparePartialTargets(a: SearchTarget, b: SearchTarget): number {
  if (a.value.length !== b.value.length) {
    return a.value.length - b.value.length
  }
  if (a.value !== b.value) {
    return a.value < b.value ? -1 : 1
  }
  return getSearchTargetRank(a) - getSearchTargetRank(b)
}
