import { getEmbedding, sampleVector } from './embeddingModel'
import { dot } from './math'
import type { EmbeddingModel } from './types'
import { EMBEDDING_BIAS } from '../consts'

export function proposePair(
  model: EmbeddingModel,
  allNodeIds: number[],
  labeledPairs: Set<string>,
): [number, number] | null {
  if (allNodeIds.length < 2) {
    return null
  }
  const u = allNodeIds[Math.floor(Math.random() * allNodeIds.length)]
  const zu = sampleVector(getEmbedding(model, u))
  let best: number | null = null
  let bestScore = -Infinity
  for (const candidate of allNodeIds) {
    if (candidate === u || labeledPairs.has(createPairKey(u, candidate))) {
      continue
    }
    const score = dot(zu, sampleVector(getEmbedding(model, candidate))) + EMBEDDING_BIAS
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }
  if (best === null) {
    return [u, pickOther(allNodeIds, u)]
  }
  return [u, best]
}

export function createPairKey(word1Id: number, word2Id: number): string {
  return `${Math.min(word1Id, word2Id)}:${Math.max(word1Id, word2Id)}`
}

function pickOther(allNodeIds: number[], u: number): number {
  const others = allNodeIds.filter((nodeId) => nodeId !== u)
  return others[Math.floor(Math.random() * others.length)]
}
