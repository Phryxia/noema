import type { ReactElement } from 'react'
import { getTagTargetLabel, TagTargetCell } from './TagCells'
import type { TagEntry } from './types'
import { WordLink } from '../qna/QnaCells'
import { PairTable } from '../relation/PairTable/PairTable'
import type { PairColumn } from '../relation/PairTable/PairTable'

export type TagColumn = 'target' | 'word'

const Columns: PairColumn<TagEntry>[] = [
  {
    key: 'target',
    header: '문장/문서',
    render: (entry) => (
      <>
        {getTagTargetLabel(entry.target)}: <TagTargetCell target={entry.target} />
      </>
    ),
  },
  {
    key: 'word',
    header: '단어',
    render: (entry) => <WordLink word={entry.word} />,
  },
]

interface TagTableProps {
  entries: TagEntry[]
  hiddenColumn?: TagColumn
}

export function TagTable({ entries, hiddenColumn }: TagTableProps): ReactElement {
  return (
    <PairTable
      entries={entries}
      columns={Columns.filter((column) => column.key !== hiddenColumn)}
    />
  )
}
