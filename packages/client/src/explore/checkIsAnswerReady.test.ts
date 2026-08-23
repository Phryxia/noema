import { describe, expect, it } from 'vitest'
import { checkIsAnswerReady } from './checkIsAnswerReady'
import { EmptyAnswer } from './consts'
import type { AnswerDraft } from './types'
import type { RelationQuestion } from '../relation/types'

function question(type: RelationQuestion['type']): RelationQuestion {
  return { type, wordIds: [1, 2, 3] }
}

function answer(overrides: Partial<AnswerDraft>): AnswerDraft {
  return { ...EmptyAnswer, ...overrides }
}

describe('checkIsAnswerReady', () => {
  it('필수 텍스트 답은 비어 있으면 안 된다', () => {
    expect(checkIsAnswerReady(question('WordExplain'), EmptyAnswer)).toBe(false)
    expect(checkIsAnswerReady(question('WordExplain'), answer({ text: '뜻' }))).toBe(true)
  })

  it('회피 가능한 텍스트 답과 답 없는 유형은 항상 준비됐다', () => {
    expect(checkIsAnswerReady(question('WordsUsage'), EmptyAnswer)).toBe(true)
    expect(checkIsAnswerReady(question('BinaryDifference'), EmptyAnswer)).toBe(true)
    expect(checkIsAnswerReady(question('NamedAssociation'), EmptyAnswer)).toBe(true)
  })

  it('유사성과 선택은 골라야 한다', () => {
    expect(checkIsAnswerReady(question('BinarySimilarity'), EmptyAnswer)).toBe(false)
    expect(checkIsAnswerReady(question('BinarySimilarity'), answer({ similarity: 0 }))).toBe(
      true,
    )
    expect(checkIsAnswerReady(question('TernaryIsolation'), EmptyAnswer)).toBe(false)
    expect(checkIsAnswerReady(question('TernaryIsolation'), answer({ selection: 3 }))).toBe(
      true,
    )
  })

  it('단어 답은 키 개수만큼 채워야 한다', () => {
    expect(checkIsAnswerReady(question('UnaryProperty'), answer({ words: [''] }))).toBe(false)
    expect(checkIsAnswerReady(question('UnaryProperty'), answer({ words: ['속성'] }))).toBe(
      true,
    )
    expect(
      checkIsAnswerReady(question('TernaryComposition'), answer({ words: ['가', ''] })),
    ).toBe(false)
    expect(
      checkIsAnswerReady(question('TernaryComposition'), answer({ words: ['가', '나'] })),
    ).toBe(true)
  })
})
