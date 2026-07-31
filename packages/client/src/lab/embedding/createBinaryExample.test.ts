import { describe, expect, it } from 'vitest'
import { createExampleFromAnswer, createExampleFromRelation } from './createBinaryExample'
import { EmptyAnswer } from '../../explore/consts'
import type { Relation } from '../../relation/types'

const base = { relationId: 1, questionId: 1, createdAt: new Date(0) }

describe('createExampleFromRelation', () => {
  it('이항 유사도는 0이면 0, 아니면 1', () => {
    const relation: Relation = {
      ...base,
      type: 'BinarySimilarity',
      word1Id: 1,
      word2Id: 2,
      similarity: 0,
    }
    expect(createExampleFromRelation(relation)).toEqual({ word1Id: 1, word2Id: 2, label: 0 })
    expect(createExampleFromRelation({ ...relation, similarity: -0.5 })).toEqual({
      word1Id: 1,
      word2Id: 2,
      label: 1,
    })
  })

  it('이항 공통점/차이점은 무응답이면 0, 답이 있으면 1', () => {
    const relation: Relation = {
      ...base,
      type: 'BinaryCommon',
      word1Id: 3,
      word2Id: 4,
      answer: null,
    }
    expect(createExampleFromRelation(relation)).toEqual({ word1Id: 3, word2Id: 4, label: 0 })
    expect(createExampleFromRelation({ ...relation, answer: { type: 'word', id: 9 } })).toEqual(
      { word1Id: 3, word2Id: 4, label: 1 },
    )
  })

  it('이항이 아닌 관계는 null', () => {
    const relation: Relation = {
      ...base,
      type: 'WordExplain',
      wordId: 1,
      answer: { type: 'sentence', id: 1 },
    }
    expect(createExampleFromRelation(relation)).toBeNull()
  })
})

describe('createExampleFromAnswer', () => {
  it('이항 유사도는 응답값으로 라벨을 정한다', () => {
    const question = { type: 'BinarySimilarity', word1Id: 1, word2Id: 2 } as const
    expect(createExampleFromAnswer(question, { ...EmptyAnswer, similarity: 0 })).toEqual({
      word1Id: 1,
      word2Id: 2,
      label: 0,
    })
    expect(createExampleFromAnswer(question, { ...EmptyAnswer, similarity: 1 })).toEqual({
      word1Id: 1,
      word2Id: 2,
      label: 1,
    })
    expect(createExampleFromAnswer(question, EmptyAnswer)).toBeNull()
  })

  it('이항 공통점/차이점은 빈 문자열이면 0', () => {
    const question = { type: 'BinaryDifference', word1Id: 1, word2Id: 2 } as const
    expect(createExampleFromAnswer(question, EmptyAnswer)).toEqual({
      word1Id: 1,
      word2Id: 2,
      label: 0,
    })
    expect(createExampleFromAnswer(question, { ...EmptyAnswer, text: '답' })).toEqual({
      word1Id: 1,
      word2Id: 2,
      label: 1,
    })
  })
})
