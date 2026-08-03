import { CHUNK_TIME_BUDGET_MS, EmptyTrajectoryPoint } from './consts'
import { createModel, updateModel } from './model/embeddingModel'
import { evaluateAccuracy } from './model/evaluateAccuracy'
import type { BinaryExample, EmbeddingModel } from './model/types'
import type { AssignedExample, TrajectoryPoint } from './types'
import type { WordTrie } from '../../word/getWordTrie'

export interface ExperimentCallbacks {
  onProgress: (ratio: number) => void
  onModelDone: (model: EmbeddingModel, trajectory: TrajectoryPoint[]) => void
}

export async function runExperiment(
  dims: number[],
  examples: AssignedExample[],
  trie: WordTrie,
  { onProgress, onModelDone }: ExperimentCallbacks,
): Promise<void> {
  const totalSteps = dims.length * examples.length
  let doneSteps = 0
  let lastYieldedAt = performance.now()
  for (const d of dims) {
    const model = createModel(d)
    const trajectory: TrajectoryPoint[] = []
    const trainSet: BinaryExample[] = []
    const testSet: BinaryExample[] = []
    let lastPoint = EmptyTrajectoryPoint
    for (const example of examples) {
      if (example.isTraining) {
        trainSet.push(example)
      } else {
        testSet.push(example)
      }
      lastPoint = consumeExample(model, trie, example, trainSet, testSet, lastPoint)
      trajectory.push(lastPoint)
      doneSteps += 1
      if (performance.now() - lastYieldedAt > CHUNK_TIME_BUDGET_MS) {
        onProgress(doneSteps / totalSteps)
        await yieldToMain()
        lastYieldedAt = performance.now()
      }
    }
    onModelDone(model, trajectory)
  }
  onProgress(1)
}

export function consumeExample(
  model: EmbeddingModel,
  trie: WordTrie,
  example: AssignedExample,
  trainSet: BinaryExample[],
  testSet: BinaryExample[],
  lastPoint: TrajectoryPoint,
): TrajectoryPoint {
  if (example.isTraining) {
    updateModel(model, trie, example.word1Id, example.word2Id, example.label)
    return { train: evaluateAccuracy(model, trie, trainSet), validation: lastPoint.validation }
  }
  return { train: lastPoint.train, validation: evaluateAccuracy(model, trie, testSet) }
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
