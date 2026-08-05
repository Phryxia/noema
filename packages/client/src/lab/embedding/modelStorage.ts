import { MODELS_STORAGE_KEY } from './consts'
import type { EmbeddingModel, NodeEmbedding } from './model/types'

interface StoredModels {
  version: 4
  models: StoredModel[]
}

interface StoredModel {
  d: number
  bias: number
  nodes: StoredNode[]
}

type StoredNode = [nodeId: number, mu: number[], varr: number[]]

export function loadStoredModels(): EmbeddingModel[] {
  const raw = localStorage.getItem(MODELS_STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!checkIsStoredModels(parsed)) {
      return []
    }
    return parsed.models.map(deserializeModel)
  } catch {
    return []
  }
}

export function saveStoredModels(models: EmbeddingModel[]): boolean {
  const payload: StoredModels = { version: 4, models: models.map(serializeModel) }
  try {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

function checkIsStoredModels(value: unknown): value is StoredModels {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as StoredModels
  return candidate.version === 4 && Array.isArray(candidate.models)
}

function deserializeModel({ d, bias, nodes }: StoredModel): EmbeddingModel {
  const entries = nodes.map(([nodeId, mu, varr]): [number, NodeEmbedding] => [
    nodeId,
    { mu, varr },
  ])
  return { d, bias, nodes: new Map(entries) }
}

function serializeModel({ d, bias, nodes }: EmbeddingModel): StoredModel {
  const entries = [...nodes.entries()]
  return {
    d,
    bias: truncate(bias),
    nodes: entries.map(([nodeId, { mu, varr }]) => [
      nodeId,
      mu.map(truncate),
      varr.map(truncate),
    ]),
  }
}

function truncate(value: number): number {
  return Number(value.toPrecision(6))
}
