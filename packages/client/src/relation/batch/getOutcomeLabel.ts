import type { BatchOutcome } from './types'
import type { RowTone } from '../../shared/getRowToneClassName'

export const OutcomeTones: Record<BatchOutcome['kind'], RowTone> = {
  success: 'success',
  duplicate: 'warning',
  failure: 'error',
}

export function getOutcomeLabel(outcome: BatchOutcome): string {
  if (outcome.kind === 'success') {
    return '성공'
  }
  if (outcome.kind === 'duplicate') {
    return '중복'
  }
  return `실패: ${outcome.reason}`
}
