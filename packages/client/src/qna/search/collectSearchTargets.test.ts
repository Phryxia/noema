import { describe, expect, it } from 'vitest'
import { collectSearchTargets } from './collectSearchTargets'
import type { Relation } from '../../relation/types'

const WordMap = new Map([
  [1, '사과'],
  [2, '배'],
  [3, '포도'],
])
const SentenceMap = new Map([[10, '사과는 빨갛다']])

function createBase(relationId = 1): {
  relationId: number
  questionId: number
  createdAt: Date
} {
  return { relationId, questionId: relationId, createdAt: new Date(0) }
}

describe('collectSearchTargets', () => {
  it('WordExplain에서 word, 단어형 answer, 문장형 comment 타깃을 만든다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'WordExplain',
      wordId: 1,
      answer: { type: 'word', id: 2 },
      comment: { type: 'sentence', id: 10 },
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word', textType: 'word', value: '사과' },
      { field: 'answer', textType: 'word', value: '배' },
      { field: 'comment', textType: 'sentence', value: '사과는 빨갛다' },
    ])
  })

  it('WordsUsage의 wordIds 원소마다 word 타깃을 만들고 answer가 null이면 answer 타깃이 없다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'WordsUsage',
      wordIds: [1, 2, 3],
      answer: null,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word', textType: 'word', value: '사과' },
      { field: 'word', textType: 'word', value: '배' },
      { field: 'word', textType: 'word', value: '포도' },
    ])
  })

  it('BinaryCommon에서 word1, word2, 문장형 answer 타깃을 만든다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'BinaryCommon',
      word1Id: 1,
      word2Id: 2,
      answer: { type: 'sentence', id: 10 },
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
      { field: 'answer', textType: 'sentence', value: '사과는 빨갛다' },
    ])
  })

  it('BinarySimilarity의 similarity는 타깃이 되지 않는다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'BinarySimilarity',
      word1Id: 1,
      word2Id: 2,
      similarity: 1,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
    ])
  })

  it('BinaryAssociation의 word2는 answer가 아니라 word2 타깃이다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'BinaryAssociation',
      word1Id: 1,
      word2Id: 2,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
    ])
  })

  it('TernaryIsolation의 selection은 별도 타깃을 만들지 않는다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'TernaryIsolation',
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
      selection: 2,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
      { field: 'word3', textType: 'word', value: '포도' },
    ])
  })

  it('NamedAssociation의 word3(관계 이름)는 word3 타깃이다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'NamedAssociation',
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
      { field: 'word3', textType: 'word', value: '포도' },
    ])
  })

  it('TernaryComposition의 세 단어는 word1, word2, word3 타깃이다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'TernaryComposition',
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'word1', textType: 'word', value: '사과' },
      { field: 'word2', textType: 'word', value: '배' },
      { field: 'word3', textType: 'word', value: '포도' },
    ])
  })

  it('삭제되어 빈 문자열로 해석되는 단어와 문장은 타깃에서 제외한다', () => {
    const relation: Relation = {
      ...createBase(),
      type: 'WordExplain',
      wordId: 99,
      answer: { type: 'sentence', id: 99 },
      comment: { type: 'word', id: 1 },
    }
    expect(collectSearchTargets(relation, WordMap, SentenceMap)).toEqual([
      { field: 'comment', textType: 'word', value: '사과' },
    ])
  })
})
