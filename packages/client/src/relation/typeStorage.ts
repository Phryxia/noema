import { TEACH_TYPE_STORAGE_KEY } from './consts'
import { WordRelationTypes } from './questionSpecs'
import type { WordRelationType } from './types'

export function loadType(): WordRelationType {
  const raw = localStorage.getItem(TEACH_TYPE_STORAGE_KEY)
  const type = WordRelationTypes.find((candidate) => candidate === raw)
  return type ?? WordRelationTypes[0]
}

export function saveType(type: WordRelationType): void {
  localStorage.setItem(TEACH_TYPE_STORAGE_KEY, type)
}
