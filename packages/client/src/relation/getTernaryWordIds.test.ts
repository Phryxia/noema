import { describe, expect, it } from 'vitest'
import { getTernaryWordIds } from './getTernaryWordIds'

describe('getTernaryWordIds', () => {
  it('NamedAssociation은 주어진 세 단어를 그대로 쓴다', () => {
    expect(getTernaryWordIds({ type: 'NamedAssociation', wordIds: [1, 2, 3] }, [])).toEqual({
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
    })
  })

  it('TernaryComposition은 답 두 단어를 word1, word2에 놓는다', () => {
    expect(getTernaryWordIds({ type: 'TernaryComposition', wordIds: [3] }, [1, 2])).toEqual({
      word1Id: 1,
      word2Id: 2,
      word3Id: 3,
    })
    expect(getTernaryWordIds({ type: 'TernaryComposition', wordIds: [3] }, [1])).toBeNull()
  })

  it('삼항 관계가 아니면 null이다', () => {
    expect(getTernaryWordIds({ type: 'TernaryIsolation', wordIds: [1, 2, 3] }, [])).toBeNull()
    expect(getTernaryWordIds({ type: 'UnaryProperty', wordIds: [1] }, [2])).toBeNull()
  })
})
