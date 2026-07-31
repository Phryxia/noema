import { TRAIN_PROBABILITY } from './consts'
import type { BinaryExample } from './model/types'
import type { AssignedExample } from './types'

export function assignSplit(example: BinaryExample): AssignedExample {
  return { ...example, isTraining: Math.random() < TRAIN_PROBABILITY }
}
