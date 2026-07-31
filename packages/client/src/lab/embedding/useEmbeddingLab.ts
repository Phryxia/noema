import { useEffect, useRef, useState } from 'react'
import { assignSplit } from './assignSplit'
import { computeDims } from './computeDims'
import type { DimRange } from './computeDims'
import { EmptyTrajectoryPoint, LAB_QUESTION_QUERY_KEY, LabQuestionTypes } from './consts'
import { createExampleFromAnswer } from './createBinaryExample'
import { loadBinaryExamples } from './loadBinaryExamples'
import { createPairKey } from './model/proposePair'
import type { BinaryExample, EmbeddingModel } from './model/types'
import { loadStoredModels, saveStoredModels } from './modelStorage'
import { pickLabQuestion } from './pickLabQuestion'
import { consumeExample, runExperiment } from './runExperiment'
import type { TrajectoryPoint } from './types'
import type { SubmitAnswerParams } from '../../explore/submitAnswer'
import { useExplore } from '../../explore/useExplore'
import type { Explore } from '../../explore/useExplore'

export interface EmbeddingLab {
  explore: Explore
  modelDims: number[]
  selectedD: number | null
  selectModel: (d: number | null) => void
  trajectories: Record<number, TrajectoryPoint[]>
  isLoaded: boolean
  isRunning: boolean
  progress: number
  startExperiment: (range: DimRange) => void
}

export function useEmbeddingLab(isEnabled: boolean): EmbeddingLab {
  const [initialModels] = useState(loadStoredModels)
  const modelsRef = useRef<EmbeddingModel[]>(initialModels)
  const selectedModelRef = useRef<EmbeddingModel | null>(null)
  const examplesRef = useRef<BinaryExample[]>([])
  const trainSetRef = useRef<BinaryExample[]>([])
  const testSetRef = useRef<BinaryExample[]>([])
  const lastPointsRef = useRef<Record<number, TrajectoryPoint>>({})
  const labeledPairsRef = useRef<Set<string>>(new Set())
  const [modelDims, setModelDims] = useState(() => initialModels.map(({ d }) => d))
  const [selectedD, setSelectedD] = useState<number | null>(null)
  const [trajectories, setTrajectories] = useState<Record<number, TrajectoryPoint[]>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const explore = useExplore(isEnabled, {
    fixedTypes: LabQuestionTypes,
    queryKey: LAB_QUESTION_QUERY_KEY,
    pickQuestion: () => pickLabQuestion(selectedModelRef.current, labeledPairsRef.current),
    onSaved: handleSaved,
  })

  useEffect(() => {
    void loadBinaryExamples().then((examples) => {
      examplesRef.current = examples
      labeledPairsRef.current = new Set(
        examples.map(({ word1Id, word2Id }) => createPairKey(word1Id, word2Id)),
      )
      setIsLoaded(true)
    })
  }, [])

  function handleSaved({ question, answer }: SubmitAnswerParams): void {
    const example = createExampleFromAnswer(question, answer)
    if (!example) {
      return
    }
    examplesRef.current.push(example)
    labeledPairsRef.current.add(createPairKey(example.word1Id, example.word2Id))
    const assigned = assignSplit(example)
    if (assigned.isTraining) {
      trainSetRef.current.push(example)
    } else {
      testSetRef.current.push(example)
    }
    const models = modelsRef.current
    if (!models.length) {
      return
    }
    const points = models.map((model): [number, TrajectoryPoint] => {
      const lastPoint = lastPointsRef.current[model.d] ?? EmptyTrajectoryPoint
      const point = consumeExample(
        model,
        assigned,
        trainSetRef.current,
        testSetRef.current,
        lastPoint,
      )
      lastPointsRef.current[model.d] = point
      return [model.d, point]
    })
    setTrajectories((prev) => {
      const next = { ...prev }
      for (const [d, point] of points) {
        next[d] = (next[d] ?? []).concat(point)
      }
      return next
    })
    if (assigned.isTraining) {
      saveStoredModels(models)
    }
  }

  function selectModel(d: number | null): void {
    setSelectedD(d)
    selectedModelRef.current = modelsRef.current.find((model) => model.d === d) ?? null
  }

  function startExperiment(range: DimRange): void {
    if (isRunning) {
      return
    }
    const dims = computeDims(range)
    if (!dims) {
      return
    }
    setIsRunning(true)
    setProgress(0)
    modelsRef.current = []
    lastPointsRef.current = {}
    setModelDims([])
    setTrajectories({})
    selectModel(null)
    const assigned = examplesRef.current.map(assignSplit)
    trainSetRef.current = assigned.filter(({ isTraining }) => isTraining)
    testSetRef.current = assigned.filter(({ isTraining }) => !isTraining)
    void runExperiment(dims, assigned, {
      onProgress: setProgress,
      onModelDone: (model, trajectory) => {
        modelsRef.current.push(model)
        lastPointsRef.current[model.d] =
          trajectory[trajectory.length - 1] ?? EmptyTrajectoryPoint
        setModelDims((prev) => prev.concat(model.d))
        setTrajectories((prev) => ({ ...prev, [model.d]: trajectory }))
        saveStoredModels(modelsRef.current)
      },
    }).finally(() => setIsRunning(false))
  }

  return {
    explore,
    modelDims,
    selectedD,
    selectModel,
    trajectories,
    isLoaded,
    isRunning,
    progress,
    startExperiment,
  }
}
