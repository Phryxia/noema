import { describe, expect, it } from 'vitest'
import { computeExactMatches, computePartialMatches } from './computeSearchMatches'
import type { QnaSearchSpace } from './types'
import type { WordRelation } from '../../relation/types'

function createSpace(relations: WordRelation[], words: [number, string][]): QnaSearchSpace {
  return { relations, wordMap: new Map(words), sentenceMap: new Map() }
}

function createAssociation(
  relationId: number,
  word1Id: number,
  word2Id: number,
  createdAt = 0,
): WordRelation {
  return {
    relationId,
    questionId: relationId,
    createdAt: new Date(createdAt),
    type: 'BinaryAssociation',
    word1Id,
    word2Id,
  }
}

function getIds(relations: WordRelation[]): number[] {
  return relations.map((relation) => relation.relationId)
}

describe('computeExactMatches', () => {
  it('word 필드 일치가 word2 필드 일치보다 앞선다', () => {
    const space = createSpace(
      [
        createAssociation(1, 2, 1),
        {
          relationId: 2,
          questionId: 2,
          createdAt: new Date(0),
          type: 'WordExplain',
          wordId: 1,
          answer: { type: 'word', id: 2 },
        },
      ],
      [
        [1, '사과'],
        [2, '배'],
      ],
    )
    expect(getIds(computeExactMatches(space, '사과'))).toEqual([2, 1])
  })

  it('단어형 answer 일치가 문장형 answer 일치보다 앞선다', () => {
    const wordAnswer: WordRelation = {
      relationId: 1,
      questionId: 1,
      createdAt: new Date(0),
      type: 'WordExplain',
      wordId: 2,
      answer: { type: 'word', id: 1 },
    }
    const sentenceAnswer: WordRelation = {
      relationId: 2,
      questionId: 2,
      createdAt: new Date(0),
      type: 'WordExplain',
      wordId: 3,
      answer: { type: 'sentence', id: 10 },
    }
    const space: QnaSearchSpace = {
      relations: [sentenceAnswer, wordAnswer],
      wordMap: new Map([
        [1, '사과'],
        [2, '배'],
        [3, '포도'],
      ]),
      sentenceMap: new Map([[10, '사과']]),
    }
    expect(getIds(computeExactMatches(space, '사과'))).toEqual([1, 2])
  })

  it('순위가 같으면 createdAt 내림차순, 동시각이면 relationId 내림차순이다', () => {
    const space = createSpace(
      [
        createAssociation(1, 1, 2, 1000),
        createAssociation(2, 1, 2, 2000),
        createAssociation(3, 1, 2, 2000),
      ],
      [
        [1, '사과'],
        [2, '배'],
      ],
    )
    expect(getIds(computeExactMatches(space, '사과'))).toEqual([3, 2, 1])
  })
})

describe('computePartialMatches', () => {
  it('정확히 일치한 관계는 다른 필드가 부분 일치해도 제외된다', () => {
    const space = createSpace(
      [createAssociation(1, 1, 2), createAssociation(2, 3, 4)],
      [
        [1, '사과'],
        [2, '사과나무'],
        [3, '사과즙'],
        [4, '배'],
      ],
    )
    expect(getIds(computePartialMatches(space, '사과'))).toEqual([2])
  })

  it('값 길이 오름차순, 같으면 사전순, 같으면 필드 순위로 정렬한다', () => {
    const space = createSpace(
      [
        createAssociation(1, 1, 5),
        createAssociation(2, 2, 5),
        createAssociation(3, 3, 5),
        createAssociation(4, 5, 4),
      ],
      [
        [1, '사과나무'],
        [2, '사과즙'],
        [3, '옛사과즙'],
        [4, '사과나무'],
        [5, '배'],
      ],
    )
    expect(getIds(computePartialMatches(space, '사과'))).toEqual([2, 1, 4, 3])
  })

  it('연속 부분 문자열만 인정하며 흩어진 글자는 불일치다', () => {
    const space = createSpace(
      [createAssociation(1, 1, 2)],
      [
        [1, '사과나무'],
        [2, '배'],
      ],
    )
    expect(computePartialMatches(space, '사나')).toEqual([])
    expect(computeExactMatches(space, '사나')).toEqual([])
  })

  it('공백 검색어도 공백을 포함한 값과 일치한다', () => {
    const space = createSpace(
      [createAssociation(1, 1, 2)],
      [
        [1, '사 과'],
        [2, '배'],
      ],
    )
    expect(getIds(computePartialMatches(space, ' '))).toEqual([1])
  })
})
