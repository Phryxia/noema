import { QuestionTypeOptions } from '../explore/consts'
import type { QuestionType } from '../question/types'
import { TEACH_TYPE_STORAGE_KEY } from './consts'

export function loadType(): QuestionType {
  const raw = localStorage.getItem(TEACH_TYPE_STORAGE_KEY)
  const spec = QuestionTypeOptions.find(({ value }) => value === raw)
  return spec?.value ?? QuestionTypeOptions[0].value
}

export function saveType(type: QuestionType): void {
  localStorage.setItem(TEACH_TYPE_STORAGE_KEY, type)
}
