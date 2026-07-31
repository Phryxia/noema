import { dot, sampleGaussian, sigmoid } from './math'
import type { EmbeddingModel, WordEmbedding } from './types'
import { EMBEDDING_BIAS, INITIAL_MU_SCALE } from '../consts'

export function createModel(d: number): EmbeddingModel {
  return { d, words: new Map() }
}

export function getEmbedding(model: EmbeddingModel, nodeId: number): WordEmbedding {
  const found = model.words.get(nodeId)
  if (found) {
    return found
  }
  const fresh: WordEmbedding = {
    mu: Array.from({ length: model.d }, () => sampleGaussian() * INITIAL_MU_SCALE),
    varr: Array.from({ length: model.d }, () => 1),
  }
  model.words.set(nodeId, fresh)
  return fresh
}

export function sampleVector(embedding: WordEmbedding): number[] {
  return embedding.mu.map((mu, i) => mu + sampleGaussian() * Math.sqrt(embedding.varr[i]))
}

export function predictPair(model: EmbeddingModel, word1Id: number, word2Id: number): number {
  const w1 = getEmbedding(model, word1Id)
  const w2 = getEmbedding(model, word2Id)
  return sigmoid(dot(w1.mu, w2.mu) + EMBEDDING_BIAS)
}

export function updateModel(
  model: EmbeddingModel,
  word1Id: number,
  word2Id: number,
  label: 0 | 1,
): void {
  const wu = getEmbedding(model, word1Id)
  const wv = getEmbedding(model, word2Id)
  const p = sigmoid(dot(wu.mu, wv.mu) + EMBEDDING_BIAS)
  const err = label - p
  for (let i = 0; i < model.d; i++) {
    wu.mu[i] += wu.varr[i] * err * wv.mu[i]
    wv.mu[i] += wv.varr[i] * err * wu.mu[i]
    wu.varr[i] /= 1 + wu.varr[i] * wv.mu[i] ** 2 * p * (1 - p)
    wv.varr[i] /= 1 + wv.varr[i] * wu.mu[i] ** 2 * p * (1 - p)
  }
}
