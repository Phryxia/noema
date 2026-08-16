import type { ReactElement } from 'react'
import { DocumentCell, SentenceCell } from './D2sCells'
import type { D2sEntry } from './types'
import { PairTable } from '../relation/PairTable/PairTable'
import type { PairColumn } from '../relation/PairTable/PairTable'

export type D2sColumn = 'document' | 'sentence'

const Columns: PairColumn<D2sEntry>[] = [
  {
    key: 'document',
    header: '문서',
    render: (entry) => <DocumentCell document={entry.document} />,
  },
  {
    key: 'sentence',
    header: '문장',
    render: (entry) => <SentenceCell sentence={entry.sentence} />,
  },
]

interface D2sTableProps {
  entries: D2sEntry[]
  hiddenColumn?: D2sColumn
}

export function D2sTable({ entries, hiddenColumn }: D2sTableProps): ReactElement {
  return (
    <PairTable
      entries={entries}
      columns={Columns.filter((column) => column.key !== hiddenColumn)}
    />
  )
}
