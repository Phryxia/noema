import { describe, expect, it } from 'vitest'
import { createModel, getEmbedding, predictPair, updateModel } from './embeddingModel'
import { dot } from './math'
import type { EmbeddingModel } from './types'

function createFixedModel(mu1: number[], mu2: number[]): EmbeddingModel {
  const model = createModel(mu1.length)
  model.words.set(1, { mu: mu1.slice(), varr: mu1.map(() => 1) })
  model.words.set(2, { mu: mu2.slice(), varr: mu2.map(() => 1) })
  return model
}

describe('getEmbedding', () => {
  it('없는 단어는 varr가 1인 임베딩을 만들어 등록한다', () => {
    const model = createModel(4)
    const embedding = getEmbedding(model, 7)
    expect(embedding.mu).toHaveLength(4)
    expect(embedding.varr).toEqual([1, 1, 1, 1])
    expect(model.words.get(7)).toBe(embedding)
  })
})

describe('predictPair', () => {
  it('내적이 0이면 bias만 남아 0.5보다 작다', () => {
    const model = createFixedModel([1, 0], [0, 1])
    expect(predictPair(model, 1, 2)).toBeLessThan(0.5)
  })
})

describe('updateModel', () => {
  it('라벨 1로 학습하면 예측 확률이 오른다', () => {
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    const before = predictPair(model, 1, 2)
    updateModel(model, 1, 2, 1)
    expect(predictPair(model, 1, 2)).toBeGreaterThan(before)
  })

  it('라벨 0으로 학습하면 예측 확률이 내린다', () => {
    const model = createFixedModel([0.5, 0.1], [0.3, 0.2])
    const before = predictPair(model, 1, 2)
    updateModel(model, 1, 2, 0)
    expect(predictPair(model, 1, 2)).toBeLessThan(before)
  })

  it('varr는 단조 감소한다', () => {
    const model = createFixedModel([0.5, 0.1], [0.3, 0.2])
    updateModel(model, 1, 2, 1)
    const wu = getEmbedding(model, 1)
    const wv = getEmbedding(model, 2)
    for (const varr of [wu.varr, wv.varr]) {
      for (const value of varr) {
        expect(value).toBeLessThanOrEqual(1)
        expect(value).toBeGreaterThan(0)
      }
    }
  })

  it('반복 학습하면 mu가 같은 방향으로 정렬된다', () => {
    const model = createFixedModel([0.5, 0.1], [0.3, -0.2])
    for (let i = 0; i < 50; i++) {
      updateModel(model, 1, 2, 1)
    }
    const wu = getEmbedding(model, 1)
    const wv = getEmbedding(model, 2)
    expect(dot(wu.mu, wv.mu)).toBeGreaterThan(0)
  })
})
