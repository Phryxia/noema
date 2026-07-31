export const LAB_QUESTION_QUERY_KEY = 'labEmbeddingQuestion'
export const MODELS_STORAGE_KEY = 'lab/embedding/models'
import type { TrajectoryPoint } from './types'

export const EMBEDDING_BIAS = -2
export const INITIAL_MU_SCALE = 0.1
export const CHUNK_TIME_BUDGET_MS = 12
export const TRAIN_PROBABILITY = 0.8

export const EmptyTrajectoryPoint: TrajectoryPoint = { train: null, validation: null }

export type LabQuestionType = 'BinarySimilarity' | 'BinaryCommon' | 'BinaryDifference'

export const LabQuestionTypes: LabQuestionType[] = [
  'BinarySimilarity',
  'BinaryCommon',
  'BinaryDifference',
]
