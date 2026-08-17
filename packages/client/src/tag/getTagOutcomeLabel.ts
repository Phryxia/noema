import type { TagOutcome } from './types'
import type { RowTone } from '../shared/getRowToneClassName'

export const TagOutcomeTones: Record<TagOutcome['kind'], RowTone> = {
  added: 'success',
  removed: 'warning',
  failure: 'error',
}

export function getTagOutcomeLabel(outcome: TagOutcome): string {
  if (outcome.kind === 'added') {
    return '추가'
  }
  if (outcome.kind === 'removed') {
    return '삭제'
  }
  return `실패: ${outcome.reason}`
}
