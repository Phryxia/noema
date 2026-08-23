import { describe, expect, it } from 'vitest'
import { EmptyAnswer } from './consts'
import { createNewRelation } from './createNewRelation'
import type { RelationTargets } from './createNewRelation'
import type { AnswerDraft } from './types'

const Sentence = { type: 'sentence', id: 10 } as const
const NoTargets: RelationTargets = { answer: null, answerWordIds: [], comment: null }

function targets(overrides: Partial<RelationTargets>): RelationTargets {
  return { ...NoTargets, ...overrides }
}

function answer(overrides: Partial<AnswerDraft>): AnswerDraft {
  return { ...EmptyAnswer, ...overrides }
}

describe('createNewRelation', () => {
  it('WordExplain은 wordId와 필수 answer를 갖는다', () => {
    expect(
      createNewRelation(
        { type: 'WordExplain', wordIds: [1] },
        EmptyAnswer,
        targets({ answer: Sentence }),
      ),
    ).toEqual({ type: 'WordExplain', wordId: 1, answer: Sentence })
    expect(() =>
      createNewRelation({ type: 'WordExplain', wordIds: [1] }, EmptyAnswer, NoTargets),
    ).toThrow('답을 입력해야 합니다')
  })

  it('WordsUsage와 이항 공통점은 answer가 null일 수 있다', () => {
    expect(
      createNewRelation({ type: 'WordsUsage', wordIds: [1, 2] }, EmptyAnswer, NoTargets),
    ).toEqual({ type: 'WordsUsage', wordIds: [1, 2], answer: null })
    expect(
      createNewRelation({ type: 'BinaryCommon', wordIds: [1, 2] }, EmptyAnswer, NoTargets),
    ).toEqual({ type: 'BinaryCommon', word1Id: 1, word2Id: 2, answer: null })
  })

  it('유사성과 선택은 답 초안에서 읽는다', () => {
    expect(
      createNewRelation(
        { type: 'BinarySimilarity', wordIds: [1, 2] },
        answer({ similarity: 0.5 }),
        NoTargets,
      ),
    ).toEqual({ type: 'BinarySimilarity', word1Id: 1, word2Id: 2, similarity: 0.5 })
    expect(
      createNewRelation(
        { type: 'TernaryIsolation', wordIds: [1, 2, 3] },
        answer({ selection: 2 }),
        NoTargets,
      ),
    ).toEqual({ type: 'TernaryIsolation', word1Id: 1, word2Id: 2, word3Id: 3, selection: 2 })
    expect(() =>
      createNewRelation({ type: 'BinarySimilarity', wordIds: [1, 2] }, EmptyAnswer, NoTargets),
    ).toThrow('유사성을 골라야 합니다')
  })

  it('답 단어가 관계의 나머지 키를 채운다', () => {
    expect(
      createNewRelation(
        { type: 'UnaryProperty', wordIds: [1] },
        EmptyAnswer,
        targets({ answerWordIds: [2] }),
      ),
    ).toEqual({ type: 'UnaryProperty', word1Id: 1, word2Id: 2 })
    expect(
      createNewRelation(
        { type: 'TernaryComposition', wordIds: [3] },
        EmptyAnswer,
        targets({ answerWordIds: [1, 2] }),
      ),
    ).toEqual({ type: 'TernaryComposition', word1Id: 1, word2Id: 2, word3Id: 3 })
    expect(() =>
      createNewRelation(
        { type: 'TernaryComposition', wordIds: [3] },
        EmptyAnswer,
        targets({ answerWordIds: [1] }),
      ),
    ).toThrow('두 단어를 입력해야 합니다')
  })

  it('NamedAssociation은 세 단어만 갖고, comment는 있을 때만 붙는다', () => {
    expect(
      createNewRelation(
        { type: 'NamedAssociation', wordIds: [1, 2, 3] },
        EmptyAnswer,
        targets({ comment: Sentence }),
      ),
    ).toEqual({
      type: 'NamedAssociation',
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
      comment: Sentence,
    })
    expect(
      createNewRelation(
        { type: 'NamedAssociation', wordIds: [1, 2, 3] },
        EmptyAnswer,
        NoTargets,
      ),
    ).not.toHaveProperty('comment')
  })
})
