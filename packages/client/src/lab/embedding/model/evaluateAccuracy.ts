import { embedWord } from './embeddingModel'
import { dot, sigmoid } from './math'
import type { BinaryExample, EmbeddingModel } from './types'
import type { WordTrie } from '../../../word/getWordTrie'

export function evaluateAccuracy(
  model: EmbeddingModel,
  trie: WordTrie,
  examples: BinaryExample[],
): number {
  if (!examples.length) {
    return 0
  }
  const muCache = new Map<number, number[]>()
  let correctCount = 0
  for (const { word1Id, word2Id, label } of examples) {
    const mu1 = getWordMu(model, trie, muCache, word1Id)
    const mu2 = getWordMu(model, trie, muCache, word2Id)
    const prediction = sigmoid(dot(mu1, mu2) + model.bias.mu) > 0.5 ? 1 : 0
    if (prediction === label) {
      correctCount += 1
    }
  }
  return correctCount / examples.length
}

function getWordMu(
  model: EmbeddingModel,
  trie: WordTrie,
  muCache: Map<number, number[]>,
  wordNodeId: number,
): number[] {
  const hit = muCache.get(wordNodeId)
  if (hit) {
    return hit
  }
  const { mu } = embedWord(model, trie, wordNodeId)
  muCache.set(wordNodeId, mu)
  return mu
}
