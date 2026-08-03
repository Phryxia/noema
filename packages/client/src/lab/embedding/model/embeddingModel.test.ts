import { describe, expect, it } from 'vitest'
import {
  createModel,
  embedWord,
  getNodeEmbedding,
  predictPair,
  updateModel,
} from './embeddingModel'
import { dot } from './math'
import type { EmbeddingModel } from './types'
import type { WordTrie } from '../../../word/getWordTrie'

function createTrie(): WordTrie {
  return {
    parents: new Map([
      [1, 0],
      [2, 0],
      [3, 1],
    ]),
    children: new Map([
      [0, [1, 2]],
      [1, [3]],
    ]),
    wordNodeIds: [1, 2, 3],
  }
}

function createFixedModel(mu1: number[], mu2: number[]): EmbeddingModel {
  const model = createModel(mu1.length)
  model.nodes.set(1, { mu: mu1.slice(), varr: mu1.map(() => 1) })
  model.nodes.set(2, { mu: mu2.slice(), varr: mu2.map(() => 1) })
  model.nodes.set(3, { mu: mu1.map(() => 0), varr: mu1.map(() => 1) })
  return model
}

describe('getNodeEmbedding', () => {
  it('없는 노드는 varr가 1인 임베딩을 만들어 등록한다', () => {
    const model = createModel(4)
    const embedding = getNodeEmbedding(model, 7)
    expect(embedding.mu).toHaveLength(4)
    expect(embedding.varr).toEqual([1, 1, 1, 1])
    expect(model.nodes.get(7)).toBe(embedding)
  })
})

describe('embedWord', () => {
  it('경로 노드들의 mu와 varr를 합산한다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    model.nodes.set(3, { mu: [0.25, -0.5], varr: [0.5, 0.5] })
    const embedding = embedWord(model, trie, 3)
    expect(embedding.mu).toEqual([0.75, -0.4])
    expect(embedding.varr).toEqual([1.5, 1.5])
  })
})

describe('predictPair', () => {
  it('내적이 0이면 bias만 남아 0.5보다 작다', () => {
    const trie = createTrie()
    const model = createFixedModel([1, 0], [0, 1])
    expect(predictPair(model, trie, 1, 2)).toBeLessThan(0.5)
  })
})

describe('updateModel', () => {
  it('라벨 1로 학습하면 예측 확률이 오른다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    const before = predictPair(model, trie, 1, 2)
    updateModel(model, trie, 1, 2, 1)
    expect(predictPair(model, trie, 1, 2)).toBeGreaterThan(before)
  })

  it('라벨 0으로 학습하면 예측 확률이 내린다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, 0.2])
    const before = predictPair(model, trie, 1, 2)
    updateModel(model, trie, 1, 2, 0)
    expect(predictPair(model, trie, 1, 2)).toBeLessThan(before)
  })

  it('varr는 단조 감소한다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, 0.2])
    updateModel(model, trie, 1, 2, 1)
    const wu = getNodeEmbedding(model, 1)
    const wv = getNodeEmbedding(model, 2)
    for (const varr of [wu.varr, wv.varr]) {
      for (const value of varr) {
        expect(value).toBeLessThanOrEqual(1)
        expect(value).toBeGreaterThan(0)
      }
    }
  })

  it('반복 학습하면 mu가 같은 방향으로 정렬된다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    for (let i = 0; i < 50; i++) {
      updateModel(model, trie, 1, 2, 1)
    }
    const wu = getNodeEmbedding(model, 1)
    const wv = getNodeEmbedding(model, 2)
    expect(dot(wu.mu, wv.mu)).toBeGreaterThan(0)
  })

  it('접두사를 공유하는 단어에 일반화된다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    const before = predictPair(model, trie, 3, 2)
    updateModel(model, trie, 1, 2, 1)
    expect(predictPair(model, trie, 3, 2)).toBeGreaterThan(before)
  })

  it('경로에 없는 노드는 갱신되지 않는다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    const node3Before = structuredClone(model.nodes.get(3))
    updateModel(model, trie, 1, 2, 1)
    expect(model.nodes.get(3)).toEqual(node3Before)
  })

  it('bias도 라벨 방향으로 학습되고 분산이 줄어든다', () => {
    const trie = createTrie()
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    const biasBefore = model.bias.mu
    updateModel(model, trie, 1, 2, 1)
    expect(model.bias.mu).toBeGreaterThan(biasBefore)
    expect(model.bias.varr).toBeLessThan(1)

    const model2 = createFixedModel([0.5, 0.1], [0.3, -0.2])
    model2.bias.mu = 0
    updateModel(model2, trie, 1, 2, 0)
    expect(model2.bias.mu).toBeLessThan(0)
  })
})
