import type { ReactElement, ReactNode } from 'react'
import classnames from 'classnames/bind'
import { RelationRow } from '../RelationRow/RelationRow'
import { formatMinute } from '../../recent/utils'
import styles from './PairTable.module.css'

const cx = classnames.bind(styles)

export interface PairEntry {
  id: number
  createdAt: Date
}

export interface PairColumn<TEntry> {
  key: string
  header: string
  render: (entry: TEntry) => ReactNode
}

interface PairTableProps<TEntry extends PairEntry> {
  entries: TEntry[]
  columns: PairColumn<TEntry>[]
}

export function PairTable<TEntry extends PairEntry>({
  entries,
  columns,
}: PairTableProps<TEntry>): ReactElement {
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={cx('text')}>
              {column.header}
            </th>
          ))}
          <th className={cx('date')}>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <RelationRow key={entry.id} relationId={entry.id}>
            {columns.map((column) => (
              <td key={column.key} className={cx('text')}>
                {column.render(entry)}
              </td>
            ))}
            <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
          </RelationRow>
        ))}
      </tbody>
    </table>
  )
}
