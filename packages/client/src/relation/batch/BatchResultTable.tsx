import type { ReactElement } from 'react'
import type { BatchOutcome, BatchResultEntry } from './types'
import { QnaTable } from '../../qna/QnaTable'
import type { QnaRowTone } from '../../qna/QnaTable'

const OutcomeTones: Record<BatchOutcome['kind'], QnaRowTone> = {
  success: 'success',
  duplicate: 'warning',
  failure: 'error',
}

interface BatchResultTableProps {
  entries: BatchResultEntry[]
}

export function BatchResultTable({ entries }: BatchResultTableProps): ReactElement {
  return (
    <QnaTable
      entries={entries}
      noteColumn={{ header: '결과', render: (entry) => getOutcomeLabel(entry.outcome) }}
      getRowTone={(entry) => OutcomeTones[entry.outcome.kind]}
    />
  )
}

function getOutcomeLabel(outcome: BatchOutcome): string {
  if (outcome.kind === 'success') {
    return '성공'
  }
  if (outcome.kind === 'duplicate') {
    return '중복'
  }
  return `실패: ${outcome.reason}`
}
