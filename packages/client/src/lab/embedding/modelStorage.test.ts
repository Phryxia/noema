import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MODELS_STORAGE_KEY } from './consts'
import type { EmbeddingModel } from './model/types'
import { loadStoredModels, saveStoredModels } from './modelStorage'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  })
})

describe('modelStorage', () => {
  it('저장한 모델을 그대로 복원한다', () => {
    const model: EmbeddingModel = {
      d: 2,
      words: new Map([
        [1, { mu: [0.5, -0.25], varr: [1, 0.5] }],
        [3, { mu: [0.125, 0], varr: [0.25, 1] }],
      ]),
    }
    saveStoredModels([model])
    expect(loadStoredModels()).toEqual([model])
  })

  it('저장 시 유효숫자 6자리로 절사한다', () => {
    const model: EmbeddingModel = {
      d: 1,
      words: new Map([[1, { mu: [0.123456789], varr: [0.987654321] }]]),
    }
    saveStoredModels([model])
    const [restored] = loadStoredModels()
    expect(restored.words.get(1)?.mu[0]).toBeCloseTo(0.123457, 6)
  })

  it('저장된 것이 없으면 빈 배열', () => {
    expect(loadStoredModels()).toEqual([])
  })

  it('손상된 데이터는 빈 배열로 폴백한다', () => {
    storage.set(MODELS_STORAGE_KEY, '{"broken"')
    expect(loadStoredModels()).toEqual([])
    storage.set(MODELS_STORAGE_KEY, JSON.stringify({ version: 2, models: [] }))
    expect(loadStoredModels()).toEqual([])
  })

  it('저장에 실패하면 false를 돌려준다', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    })
    expect(saveStoredModels([])).toBe(false)
  })
})
