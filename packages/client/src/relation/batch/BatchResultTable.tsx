import type { ReactElement } from 'react'
import { getOutcomeLabel, OutcomeTones } from './getOutcomeLabel'
import type { BatchResultEntry } from './types'
import { QnaTable } from '../../qna/QnaTable'

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
