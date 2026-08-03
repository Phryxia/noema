import { getNodeEmbedding } from './embeddingModel'
import { dot, sampleGaussian, sampleGumbel } from './math'
import type { EmbeddingModel } from './types'
import { SOFTMAX_TEMPERATURE } from '../consts'
import { ROOT_NODE_ID } from '../../../word/consts'
import { getPathNodeIds } from '../../../word/getWordTrie'
import type { WordTrie } from '../../../word/getWordTrie'

export function proposePair(
  model: EmbeddingModel,
  trie: WordTrie,
  labeledPairs: Set<string>,
): [number, number] | null {
  const { wordNodeIds } = trie
  if (wordNodeIds.length < 2) {
    return null
  }
  const u = wordNodeIds[Math.floor(Math.random() * wordNodeIds.length)]
  const wordNodeIdSet = new Set(wordNodeIds)
  const noise = new Map<number, number[]>()

  function contrib(nodeId: number): number[] {
    const hit = noise.get(nodeId)
    if (hit) {
      return hit
    }
    const node = getNodeEmbedding(model, nodeId)
    const fresh = node.mu.map((mu, i) => mu + sampleGaussian() * Math.sqrt(node.varr[i]))
    noise.set(nodeId, fresh)
    return fresh
  }

  const zu = Array.from({ length: model.d }, () => 0)
  for (const nodeId of getPathNodeIds(trie, u)) {
    const c = contrib(nodeId)
    for (let i = 0; i < model.d; i++) {
      zu[i] += c[i]
    }
  }

  const acc = Array.from({ length: model.d }, () => 0)
  let best: number | null = null
  let bestScore = -Infinity

  function scan(nodeId: number): void {
    if (
      wordNodeIdSet.has(nodeId) &&
      nodeId !== u &&
      !labeledPairs.has(createPairKey(u, nodeId))
    ) {
      const score = dot(zu, acc) + model.bias.mu + SOFTMAX_TEMPERATURE * sampleGumbel()
      if (score > bestScore) {
        bestScore = score
        best = nodeId
      }
    }
    for (const childId of trie.children.get(nodeId) ?? []) {
      const c = contrib(childId)
      for (let i = 0; i < model.d; i++) {
        acc[i] += c[i]
      }
      scan(childId)
      for (let i = 0; i < model.d; i++) {
        acc[i] -= c[i]
      }
    }
  }

  scan(ROOT_NODE_ID)
  if (best === null) {
    return [u, pickOther(wordNodeIds, u)]
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
