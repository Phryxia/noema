import { describe, expect, it } from 'vitest'
import { createModel } from './model/embeddingModel'
import type { EmbeddingModel } from './model/types'
import { consumeExample } from './runExperiment'
import type { AssignedExample } from './types'

function createFixedModel(): EmbeddingModel {
  const model = createModel(2)
  model.words.set(1, { mu: [0.5, 0.1], varr: [1, 1] })
  model.words.set(2, { mu: [0.3, -0.2], varr: [1, 1] })
  return model
}

const trainingExample: AssignedExample = { word1Id: 1, word2Id: 2, label: 1, isTraining: true }
const testExample: AssignedExample = { word1Id: 1, word2Id: 2, label: 1, isTraining: false }

describe('consumeExample', () => {
  it('training이면 모델을 갱신하고 training accuracy만 갱신한다', () => {
    const model = createFixedModel()
    const muBefore = model.words.get(1)?.mu.slice()
    const point = consumeExample(model, trainingExample, [trainingExample], [], {
      train: null,
      validation: 0.75,
    })
    expect(model.words.get(1)?.mu).not.toEqual(muBefore)
    expect(point.train).not.toBeNull()
    expect(point.validation).toBe(0.75)
  })

  it('test면 모델을 갱신하지 않고 validation accuracy만 갱신한다', () => {
    const model = createFixedModel()
    const muBefore = model.words.get(1)?.mu.slice()
    const varrBefore = model.words.get(1)?.varr.slice()
    const point = consumeExample(model, testExample, [], [testExample], {
      train: 0.5,
      validation: null,
    })
    expect(model.words.get(1)?.mu).toEqual(muBefore)
    expect(model.words.get(1)?.varr).toEqual(varrBefore)
    expect(point.train).toBe(0.5)
    expect(point.validation).not.toBeNull()
  })
})
