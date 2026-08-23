import { QuestionTypeOptions } from '../explore/consts'
import { TEACH_TYPE_STORAGE_KEY } from './consts'
import type { WordRelationType } from './types'

export function loadType(): WordRelationType {
  const raw = localStorage.getItem(TEACH_TYPE_STORAGE_KEY)
  const spec = QuestionTypeOptions.find(({ value }) => value === raw)
  return spec?.value ?? QuestionTypeOptions[0].value
}

export function saveType(type: WordRelationType): void {
  localStorage.setItem(TEACH_TYPE_STORAGE_KEY, type)
}
