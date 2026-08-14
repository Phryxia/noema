import { describe, expect, it } from 'vitest'
import { comparePartialTargets, getSearchTargetRank } from './compareSearchTargets'
import type { SearchTarget } from './types'

function createTarget(overrides: Partial<SearchTarget>): SearchTarget {
  return { field: 'word', textType: 'word', value: '사과', ...overrides }
}

describe('getSearchTargetRank', () => {
  it('필드 순위는 word, word1, word2, word3, answer, comment 순으로 단조 증가한다', () => {
    const ranks = (['word', 'word1', 'word2', 'word3', 'answer', 'comment'] as const).map(
      (field) => getSearchTargetRank(createTarget({ field })),
    )
    expect(ranks).toEqual(ranks.slice().sort((a, b) => a - b))
    expect(new Set(ranks).size).toBe(ranks.length)
  })

  it('같은 필드에서는 단어형이 문장형보다 앞선다', () => {
    const answerWord = getSearchTargetRank(createTarget({ field: 'answer' }))
    const answerSentence = getSearchTargetRank(
      createTarget({ field: 'answer', textType: 'sentence' }),
    )
    const commentWord = getSearchTargetRank(createTarget({ field: 'comment' }))
    expect(answerWord).toBeLessThan(answerSentence)
    expect(answerSentence).toBeLessThan(commentWord)
  })
})

describe('comparePartialTargets', () => {
  it('값 길이가 짧은 쪽이 먼저다', () => {
    const shorter = createTarget({ value: '사과즙' })
    const longer = createTarget({ value: '사과나무' })
    expect(comparePartialTargets(shorter, longer)).toBeLessThan(0)
    expect(comparePartialTargets(longer, shorter)).toBeGreaterThan(0)
  })

  it('길이가 같으면 사전순으로 앞서는 값이 먼저다', () => {
    const former = createTarget({ value: '사과가' })
    const latter = createTarget({ value: '사과나' })
    expect(comparePartialTargets(former, latter)).toBeLessThan(0)
  })

  it('값까지 같으면 필드 순위로 가른다', () => {
    const word = createTarget({ field: 'word' })
    const comment = createTarget({ field: 'comment' })
    expect(comparePartialTargets(word, comment)).toBeLessThan(0)
    expect(comparePartialTargets(word, createTarget({ field: 'word' }))).toBe(0)
  })
})
