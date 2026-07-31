import { MODELS_STORAGE_KEY } from './consts'
import type { EmbeddingModel, WordEmbedding } from './model/types'

interface StoredModels {
  version: 1
  models: StoredModel[]
}

interface StoredModel {
  d: number
  words: StoredWord[]
}

type StoredWord = [nodeId: number, mu: number[], varr: number[]]

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
  const payload: StoredModels = { version: 1, models: models.map(serializeModel) }
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
  return candidate.version === 1 && Array.isArray(candidate.models)
}

function deserializeModel({ d, words }: StoredModel): EmbeddingModel {
  const entries = words.map(([nodeId, mu, varr]): [number, WordEmbedding] => [
    nodeId,
    { mu, varr },
  ])
  return { d, words: new Map(entries) }
}

function serializeModel({ d, words }: EmbeddingModel): StoredModel {
  const entries = [...words.entries()]
  return {
    d,
    words: entries.map(([nodeId, { mu, varr }]) => [
      nodeId,
      mu.map(truncate),
      varr.map(truncate),
    ]),
  }
}

function truncate(value: number): number {
  return Number(value.toPrecision(6))
}
