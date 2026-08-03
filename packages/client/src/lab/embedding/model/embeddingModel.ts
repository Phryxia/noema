import { dot, sampleGaussian, sigmoid } from './math'
import type { EmbeddingModel, NodeEmbedding, WordEmbedding } from './types'
import { INITIAL_BIAS, INITIAL_MU_SCALE } from '../consts'
import { getPathNodeIds } from '../../../word/getWordTrie'
import type { WordTrie } from '../../../word/getWordTrie'

export function createModel(d: number): EmbeddingModel {
  return { d, bias: { mu: INITIAL_BIAS, varr: 1 }, nodes: new Map() }
}

export function getNodeEmbedding(model: EmbeddingModel, nodeId: number): NodeEmbedding {
  const found = model.nodes.get(nodeId)
  if (found) {
    return found
  }
  const fresh: NodeEmbedding = {
    mu: Array.from({ length: model.d }, () => sampleGaussian() * INITIAL_MU_SCALE),
    varr: Array.from({ length: model.d }, () => 1),
  }
  model.nodes.set(nodeId, fresh)
  return fresh
}

export function embedWord(
  model: EmbeddingModel,
  trie: WordTrie,
  wordNodeId: number,
): WordEmbedding {
  const mu = Array.from({ length: model.d }, () => 0)
  const varr = Array.from({ length: model.d }, () => 0)
  for (const nodeId of getPathNodeIds(trie, wordNodeId)) {
    const node = getNodeEmbedding(model, nodeId)
    for (let i = 0; i < model.d; i++) {
      mu[i] += node.mu[i]
      varr[i] += node.varr[i]
    }
  }
  return { mu, varr }
}

export function predictPair(
  model: EmbeddingModel,
  trie: WordTrie,
  word1Id: number,
  word2Id: number,
): number {
  const e1 = embedWord(model, trie, word1Id)
  const e2 = embedWord(model, trie, word2Id)
  return sigmoid(dot(e1.mu, e2.mu) + model.bias.mu)
}

export function updateModel(
  model: EmbeddingModel,
  trie: WordTrie,
  word1Id: number,
  word2Id: number,
  label: 0 | 1,
): void {
  const eu = embedWord(model, trie, word1Id)
  const ev = embedWord(model, trie, word2Id)
  const p = sigmoid(dot(eu.mu, ev.mu) + model.bias.mu)
  const err = label - p
  const gain = p * (1 - p)
  updatePathNodes(model, getPathNodeIds(trie, word1Id), err, gain, ev.mu)
  updatePathNodes(model, getPathNodeIds(trie, word2Id), err, gain, eu.mu)
  model.bias.mu += model.bias.varr * err
  model.bias.varr /= 1 + model.bias.varr * gain
}

function updatePathNodes(
  model: EmbeddingModel,
  pathNodeIds: number[],
  err: number,
  gain: number,
  otherMu: number[],
): void {
  for (const nodeId of pathNodeIds) {
    const node = getNodeEmbedding(model, nodeId)
    for (let i = 0; i < model.d; i++) {
      node.mu[i] += node.varr[i] * err * otherMu[i]
      node.varr[i] /= 1 + node.varr[i] * otherMu[i] ** 2 * gain
    }
  }
}
