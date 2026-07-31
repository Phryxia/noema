import { predictPair } from './embeddingModel'
import type { BinaryExample, EmbeddingModel } from './types'

export function evaluateAccuracy(model: EmbeddingModel, examples: BinaryExample[]): number {
  if (!examples.length) {
    return 0
  }
  let correctCount = 0
  for (const { word1Id, word2Id, label } of examples) {
    const prediction = predictPair(model, word1Id, word2Id) > 0.5 ? 1 : 0
    if (prediction === label) {
      correctCount += 1
    }
  }
  return correctCount / examples.length
}
