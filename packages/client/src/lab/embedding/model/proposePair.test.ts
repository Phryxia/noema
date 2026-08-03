import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createModel } from './embeddingModel'
import type * as MathModule from './math'
import { createPairKey, proposePair } from './proposePair'
import type { EmbeddingModel } from './types'
import type { WordTrie } from '../../../word/getWordTrie'

vi.mock('./math', async (importOriginal) => {
  const actual = await importOriginal<typeof MathModule>()
  return {
    ...actual,
    sampleGaussian: (): number => 0,
    sampleGumbel: (): number => 0,
  }
})

function createTrie(): WordTrie {
  return {
    parents: new Map([
      [1, 0],
      [2, 1],
      [3, 0],
      [4, 3],
    ]),
    children: new Map([
      [0, [1, 3]],
      [1, [2]],
      [3, [4]],
    ]),
    wordNodeIds: [2, 3, 4],
  }
}

function createFixedModel(): EmbeddingModel {
  const model = createModel(2)
  model.nodes.set(1, { mu: [1, 0], varr: [1, 1] })
  model.nodes.set(2, { mu: [0, 1], varr: [1, 1] })
  model.nodes.set(3, { mu: [2, 0], varr: [1, 1] })
  model.nodes.set(4, { mu: [-5, 0], varr: [1, 1] })
  return model
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('proposePair', () => {
  it('경로 합 점수가 가장 높은 후보를 고른다', () => {
    const pair = proposePair(createFixedModel(), createTrie(), new Set())
    expect(pair).toEqual([2, 3])
  })

  it('라벨된 쌍은 건너뛴다', () => {
    const labeled = new Set([createPairKey(2, 3)])
    const pair = proposePair(createFixedModel(), createTrie(), labeled)
    expect(pair).toEqual([2, 4])
  })

  it('전부 라벨된 경우 무작위 폴백한다', () => {
    const labeled = new Set([createPairKey(2, 3), createPairKey(2, 4)])
    const pair = proposePair(createFixedModel(), createTrie(), labeled)
    expect(pair).toEqual([2, 3])
  })

  it('단어가 2개 미만이면 null을 돌려준다', () => {
    const trie = createTrie()
    trie.wordNodeIds = [2]
    expect(proposePair(createFixedModel(), trie, new Set())).toBeNull()
  })
})
