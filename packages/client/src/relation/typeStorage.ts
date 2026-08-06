import { QuestionTypeSpecs } from '../explore/consts'
import type { QuestionType } from '../question/types'
import { TEACH_TYPE_STORAGE_KEY } from './consts'

export function loadType(): QuestionType {
  const raw = localStorage.getItem(TEACH_TYPE_STORAGE_KEY)
  const spec = QuestionTypeSpecs.find(({ type }) => type === raw)
  return spec?.type ?? QuestionTypeSpecs[0].type
}

export function saveType(type: QuestionType): void {
  localStorage.setItem(TEACH_TYPE_STORAGE_KEY, type)
}
