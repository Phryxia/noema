import type { BinaryExample } from './model/types'

export interface TrajectoryPoint {
  train: number | null
  validation: number | null
}

export interface AssignedExample extends BinaryExample {
  isTraining: boolean
}
