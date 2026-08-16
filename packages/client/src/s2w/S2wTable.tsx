import type { ReactElement } from 'react'
import type { S2wEntry } from './types'
import { SentenceCell } from '../d2s/D2sCells'
import { WordLink } from '../qna/QnaCells'
import { PairTable } from '../relation/PairTable/PairTable'
import type { PairColumn } from '../relation/PairTable/PairTable'

export type S2wColumn = 'sentence' | 'word'

const Columns: PairColumn<S2wEntry>[] = [
  {
    key: 'sentence',
    header: '문장',
    render: (entry) => <SentenceCell sentence={entry.sentence} />,
  },
  {
    key: 'word',
    header: '단어',
    render: (entry) => <WordLink word={entry.word} />,
  },
]

interface S2wTableProps {
  entries: S2wEntry[]
  hiddenColumn?: S2wColumn
}

export function S2wTable({ entries, hiddenColumn }: S2wTableProps): ReactElement {
  return (
    <PairTable
      entries={entries}
      columns={Columns.filter((column) => column.key !== hiddenColumn)}
    />
  )
}
